#!/usr/bin/env python3
"""
Script to analyze the distribution of components and UI types across all forms.
Analyzes both manual_config.json and llm_generated_config.json from the public folder.
"""

import json
from collections import defaultdict, Counter
from pathlib import Path
from typing import Dict, Any, List
import os

# Path to config files
PUBLIC_DIR = Path("public")
MANUAL_CONFIG_PATH = PUBLIC_DIR / "manual_config.json"
LLM_CONFIG_PATH = PUBLIC_DIR / "llm_generated_config.json"

# Valid date styles and range styles
DATE_STYLES = ["default", "ios-scroll", "text-input"]
RANGE_STYLES = ["single-calendar", "dual-calendar"]

# Valid layouts
LAYOUTS = ["single-column", "two-column", "split-screen", "wizard-style", "website-style"]

# Valid form types
FORM_TYPES = ["single-page", "multipage"]


def load_json_file(file_path: Path) -> Dict[str, Any]:
    """Load a JSON file and return its contents."""
    if not file_path.exists():
        print(f"⚠️  Warning: {file_path} not found. Skipping...")
        return {}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing {file_path}: {e}")
        return {}


def analyze_forms(config: Dict[str, Any], source_name: str) -> Dict[str, Any]:
    """Analyze a configuration dictionary and return statistics."""
    stats = {
        'total_forms': len(config),
        'field_types': Counter(),
        'date_styles': Counter(),
        'range_styles': Counter(),
        'layouts': Counter(),
        'form_types': Counter(),
        'total_fields': 0,
        'total_pages': 0,
        'fields_per_form': [],
        'pages_per_form': [],
        'required_fields': 0,
        'optional_fields': 0,
        'fields_with_options': Counter(),  # Field types that have options
        'date_fields_with_restrictions': Counter(),  # before/after restrictions
    }
    
    for form_id, form_data in config.items():
        if not isinstance(form_data, dict):
            continue
        
        # Count form type
        form_type = form_data.get('type', 'unknown')
        stats['form_types'][form_type] += 1
        
        # Count layout
        layout = form_data.get('layout', 'single-column')
        stats['layouts'][layout] += 1
        
        # Count pages
        pages = form_data.get('pages', [])
        num_pages = len(pages)
        stats['total_pages'] += num_pages
        stats['pages_per_form'].append(num_pages)
        
        # Analyze fields
        form_field_count = 0
        for page in pages:
            fields = page.get('fields', [])
            form_field_count += len(fields)
            
            for field in fields:
                field_type = field.get('type', 'unknown')
                stats['field_types'][field_type] += 1
                stats['total_fields'] += 1
                
                # Count required vs optional
                if field.get('required', False):
                    stats['required_fields'] += 1
                else:
                    stats['optional_fields'] += 1
                
                # Count fields with options
                if field.get('options'):
                    stats['fields_with_options'][field_type] += 1
                
                # Analyze date fields
                if field_type == 'date':
                    date_style = field.get('dateStyle')
                    if date_style:
                        stats['date_styles'][date_style] += 1
                    else:
                        stats['date_styles']['not-set'] += 1
                    
                    # Check for date restrictions
                    allowed = field.get('allowed')
                    if allowed:
                        stats['date_fields_with_restrictions'][allowed] += 1
                
                # Analyze date-range fields
                elif field_type == 'date-range':
                    range_style = field.get('rangeStyle')
                    if range_style:
                        stats['range_styles'][range_style] += 1
                    else:
                        stats['range_styles']['not-set'] += 1
        
        stats['fields_per_form'].append(form_field_count)
    
    return stats


def print_statistics(stats: Dict[str, Any], source_name: str):
    """Print formatted statistics."""
    print(f"\n{'='*80}")
    print(f"📊 STATISTICS FOR: {source_name.upper()}")
    print(f"{'='*80}\n")
    
    print(f"📋 Overall Statistics:")
    print(f"   Total Forms: {stats['total_forms']}")
    print(f"   Total Pages: {stats['total_pages']}")
    print(f"   Total Fields: {stats['total_fields']}")
    if stats['total_forms'] > 0:
        print(f"   Average Fields per Form: {sum(stats['fields_per_form']) / len(stats['fields_per_form']):.2f}")
        print(f"   Average Pages per Form: {sum(stats['pages_per_form']) / len(stats['pages_per_form']):.2f}")
    print(f"   Required Fields: {stats['required_fields']}")
    print(f"   Optional Fields: {stats['optional_fields']}")
    
    print(f"\n📝 Form Types Distribution:")
    for form_type in FORM_TYPES:
        count = stats['form_types'].get(form_type, 0)
        percentage = (count / stats['total_forms'] * 100) if stats['total_forms'] > 0 else 0
        print(f"   {form_type:20s}: {count:3d} ({percentage:5.1f}%)")
    
    print(f"\n🎨 Layout Distribution:")
    for layout in LAYOUTS:
        count = stats['layouts'].get(layout, 0)
        percentage = (count / stats['total_forms'] * 100) if stats['total_forms'] > 0 else 0
        print(f"   {layout:20s}: {count:3d} ({percentage:5.1f}%)")
    
    print(f"\n🔧 Field Types Distribution:")
    # Sort by count descending
    sorted_field_types = sorted(stats['field_types'].items(), key=lambda x: x[1], reverse=True)
    for field_type, count in sorted_field_types:
        percentage = (count / stats['total_fields'] * 100) if stats['total_fields'] > 0 else 0
        print(f"   {field_type:25s}: {count:3d} ({percentage:5.1f}%)")
    
    print(f"\n📅 Date Picker Styles Distribution:")
    total_date_fields = sum(stats['date_styles'].values())
    for style in DATE_STYLES + ['not-set']:
        count = stats['date_styles'].get(style, 0)
        if total_date_fields > 0:
            percentage = (count / total_date_fields * 100)
            print(f"   {style:20s}: {count:3d} ({percentage:5.1f}%)")
    
    print(f"\n📆 Date Range Picker Styles Distribution:")
    total_range_fields = sum(stats['range_styles'].values())
    for style in RANGE_STYLES + ['not-set']:
        count = stats['range_styles'].get(style, 0)
        if total_range_fields > 0:
            percentage = (count / total_range_fields * 100)
            print(f"   {style:20s}: {count:3d} ({percentage:5.1f}%)")
    
    if stats['date_fields_with_restrictions']:
        print(f"\n🔒 Date Field Restrictions:")
        total_restricted = sum(stats['date_fields_with_restrictions'].values())
        for restriction, count in stats['date_fields_with_restrictions'].items():
            percentage = (count / total_restricted * 100) if total_restricted > 0 else 0
            print(f"   {restriction:20s}: {count:3d} ({percentage:5.1f}%)")
    
    if stats['fields_with_options']:
        print(f"\n📋 Fields with Options (by type):")
        sorted_with_options = sorted(stats['fields_with_options'].items(), key=lambda x: x[1], reverse=True)
        for field_type, count in sorted_with_options:
            print(f"   {field_type:25s}: {count:3d}")


def merge_statistics(stats_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge multiple statistics dictionaries."""
    merged = {
        'total_forms': sum(s['total_forms'] for s in stats_list),
        'field_types': Counter(),
        'date_styles': Counter(),
        'range_styles': Counter(),
        'layouts': Counter(),
        'form_types': Counter(),
        'total_fields': sum(s['total_fields'] for s in stats_list),
        'total_pages': sum(s['total_pages'] for s in stats_list),
        'fields_per_form': [],
        'pages_per_form': [],
        'required_fields': sum(s['required_fields'] for s in stats_list),
        'optional_fields': sum(s['optional_fields'] for s in stats_list),
        'fields_with_options': Counter(),
        'date_fields_with_restrictions': Counter(),
    }
    
    for stats in stats_list:
        merged['field_types'].update(stats['field_types'])
        merged['date_styles'].update(stats['date_styles'])
        merged['range_styles'].update(stats['range_styles'])
        merged['layouts'].update(stats['layouts'])
        merged['form_types'].update(stats['form_types'])
        merged['fields_with_options'].update(stats['fields_with_options'])
        merged['date_fields_with_restrictions'].update(stats['date_fields_with_restrictions'])
        merged['fields_per_form'].extend(stats['fields_per_form'])
        merged['pages_per_form'].extend(stats['pages_per_form'])
    
    return merged


def main():
    """Main function to run the distribution analysis."""
    print("🔍 Form Component Distribution Analyzer")
    print("=" * 80)
    
    # Load configurations
    manual_config = load_json_file(MANUAL_CONFIG_PATH)
    llm_config = load_json_file(LLM_CONFIG_PATH)
    
    # Analyze each source
    all_stats = []
    
    if manual_config:
        manual_stats = analyze_forms(manual_config, "Manual Config")
        all_stats.append(manual_stats)
        print_statistics(manual_stats, "Manual Config")
    
    if llm_config:
        llm_stats = analyze_forms(llm_config, "LLM Generated Config")
        all_stats.append(llm_stats)
        print_statistics(llm_stats, "LLM Generated Config")
    
    # Print combined statistics
    if all_stats:
        combined_stats = merge_statistics(all_stats)
        print_statistics(combined_stats, "Combined (All Forms)")
        
        # Print summary
        print(f"\n{'='*80}")
        print(f"📈 SUMMARY")
        print(f"{'='*80}\n")
        print(f"Total Forms Analyzed: {combined_stats['total_forms']}")
        print(f"Total Fields: {combined_stats['total_fields']}")
        print(f"Total Pages: {combined_stats['total_pages']}")
        print(f"\nMost Common Field Types:")
        top_fields = sorted(combined_stats['field_types'].items(), key=lambda x: x[1], reverse=True)[:5]
        for field_type, count in top_fields:
            print(f"   • {field_type}: {count}")
        
        print(f"\nDate Picker Style Distribution:")
        for style in DATE_STYLES:
            count = combined_stats['date_styles'].get(style, 0)
            print(f"   • {style}: {count}")
        
        print(f"\nDate Range Picker Style Distribution:")
        for style in RANGE_STYLES:
            count = combined_stats['range_styles'].get(style, 0)
            print(f"   • {style}: {count}")
    else:
        print("\n❌ No configuration files found. Please ensure both files exist in the public/ folder.")


if __name__ == "__main__":
    main()

