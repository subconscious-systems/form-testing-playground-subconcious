import json
import os
import random
from typing import Dict, Any, List

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, field_validator

# ==================== ENV + CLIENT ====================

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found. Put it in .env")

client = OpenAI(api_key=api_key)


# ==================== Pydantic for LLM output ====================

class TrainingInstructions(BaseModel):
    """
    LLM output: just a list of 5 instructions (strings).
    We'll attach masked + maskedFields ourselves in code.
    """
    instructions: List[str]

    @field_validator("instructions")
    @classmethod
    def check_length(cls, v):
        if len(v) != 5:
            raise ValueError(f"Expected exactly 5 instructions, got {len(v)}")
        return v


# ==================== Helper: generate 5 instructions for one form ====================

def generate_instructions_for_form(
    form: Dict[str, Any],
    mask_flags: List[bool],
    masked_fields_per_task: List[List[str]],
) -> List[str]:
    """
    Call the LLM once to generate 5 instructions for a given form.

    All instructions MUST:
      - be first-person
      - use EXACTLY the values in form["groundTruth"] for any mentioned fields
      - NEVER invent or change values
    For tasks where masked_fields_per_task[i] is non-empty, the instruction must
    NOT mention those fields at all.
    """

    form_id = form.get("id", "unknown")
    title = form.get("title", "")
    base_input = form.get("inputToLLM", "")
    ground_truth = form.get("groundTruth", {})

    # Collect simple field metadata: id, label, type
    fields_meta = []
    for page in form.get("pages", []):
        for field in page.get("fields", []):
            fields_meta.append({
                "id": field.get("id"),
                "label": field.get("label"),
                "type": field.get("type"),
            })

    # Build tasks spec for the prompt (what to mask per task)
    tasks_spec = []
    for i in range(5):
        tasks_spec.append({
            "taskId": f"task_{i+1}",
            "masked": mask_flags[i],
            "maskedFields": masked_fields_per_task[i],
        })

    system_prompt = (
        "You generate first-person natural language descriptions for filling out a form.\n"
        "You are given:\n"
        "- The list of fields (id, label, type)\n"
        "- A groundTruth mapping from field id -> value\n"
        "- A tasks list specifying for each of 5 tasks which field ids are masked\n\n"
        "Your job:\n"
        "- For EACH of the 5 tasks, write ONE first-person paragraph (instruction) "
        "describing the same person and values in groundTruth.\n"
        "- All 5 tasks MUST describe EXACTLY the same values (name, dates, amounts, etc.), "
        "copied from groundTruth. You must NOT invent, change, or add any new values.\n"
        "- You may only vary the wording/phrasing, not the underlying values.\n"
        "- For a task where maskedFields is empty, you should clearly mention ALL fields and "
        "their values from groundTruth.\n"
        "- For a task where maskedFields is non-empty, you MUST NOT mention those masked field ids at all. "
        "Do NOT hint or partially mention them. Just omit those fields from the text.\n"
        "- When you mention a field, its value MUST exactly match groundTruth (same spelling, numbers, dates, etc.).\n"
        "- Do NOT invent new personal details, companies, addresses, or phone numbers. Only use values from groundTruth.\n\n"
        "Output strictly JSON with a single key 'instructions' mapping to an array of 5 strings.\n"
        "instructions[0] corresponds to task_1, instructions[1] to task_2, etc."
    )

    user_content = {
        "formId": form_id,
        "title": title,
        "baseInputToLLM": base_input,
        "fields": fields_meta,
        "groundTruth": ground_truth,
        "tasks": tasks_spec,
    }

    response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": (
                    "Here is the form and tasks specification. "
                    "Remember: NEVER change or invent values. Always copy values from groundTruth exactly. "
                    "For masked fields, do not mention them at all in that task's instruction.\n\n"
                    + json.dumps(user_content, indent=2)
                ),
            },
        ],
        response_format=TrainingInstructions,
        temperature=0.4,  # low-ish for determinism in content, but paraphrasing is still possible
    )

    parsed: TrainingInstructions = response.choices[0].message.parsed
    return parsed.instructions


# ==================== Main script ====================

def main():
    manual_config_file = "public/manual_config.json"
    llm_config_file = "public/llm_generated_config.json"

    # ---- Load configs ----
    manual_config: Dict[str, Any] = {}
    if os.path.exists(manual_config_file):
        with open(manual_config_file, "r", encoding="utf-8") as f:
            manual_config = json.load(f)
        print(f"Loaded {len(manual_config)} manual forms from {manual_config_file}")
    else:
        print(f"No manual config found at {manual_config_file}, continuing with empty manual set.")

    llm_config: Dict[str, Any] = {}
    if os.path.exists(llm_config_file):
        with open(llm_config_file, "r", encoding="utf-8") as f:
            llm_config = json.load(f)
        print(f"Loaded {len(llm_config)} LLM forms from {llm_config_file}")
    else:
        print(f"No LLM-generated config found at {llm_config_file}, continuing with empty LLM set.")

    # Collect all forms (ordered) as (source_name, source_dict, form_id)
    forms_index: List[tuple[str, Dict[str, Any], str]] = []
    for fid in sorted(manual_config.keys(), key=lambda x: int(x) if x.isdigit() else x):
        forms_index.append(("manual", manual_config, fid))
    for fid in sorted(llm_config.keys(), key=lambda x: int(x) if x.isdigit() else x):
        forms_index.append(("llm", llm_config, fid))

    total_forms = len(forms_index)
    if total_forms == 0:
        print("No forms found in either config. Nothing to do.")
        return

    tasks_per_form = 5
    total_tasks = total_forms * tasks_per_form
    num_masked = max(1, int(total_tasks * 0.1))  # ~10%

    print(f"Total forms: {total_forms}")
    print(f"Total training tasks: {total_tasks}")
    print(f"Number of masked tasks (~10%): {num_masked}")

    # ---- Choose which global tasks are masked ----
    random.seed(42)  # reproducible
    all_task_indices = list(range(total_tasks))  # 0..total_tasks-1
    masked_global_indices = set(random.sample(all_task_indices, num_masked))

    # ---- For each form, compute mask flags and generate instructions ----
    global_task_counter = 0

    for (source_name, source_dict, form_id) in forms_index:
        form = source_dict[form_id]
        print(f"\nProcessing form {form_id} ({source_name}) - {form.get('title', '')}")

        # Some forms may already have trainingTasks; we overwrite them
        if "trainingTasks" in form:
            print("  Note: form already has trainingTasks, they will be overwritten.")

        # Determine mask_flags and maskedFields for this form's 5 tasks
        # We will mask fields from groundTruth keys
        gt = form.get("groundTruth", {})
        field_ids = list(gt.keys())

        mask_flags: List[bool] = []
        masked_fields_per_task: List[List[str]] = []

        for i in range(tasks_per_form):
            global_index = global_task_counter
            global_task_counter += 1

            masked = global_index in masked_global_indices
            mask_flags.append(masked)

            if masked and field_ids:
                # choose 1–min(3, len(field_ids)) fields to omit in this task
                num_to_mask = min(len(field_ids), max(1, len(field_ids) // 3))
                masked_fields = random.sample(field_ids, num_to_mask)
            else:
                masked_fields = []

            masked_fields_per_task.append(masked_fields)

        # Call LLM to generate 5 instructions for this form
        try:
            instructions = generate_instructions_for_form(form, mask_flags, masked_fields_per_task)
        except Exception as e:
            print(f"  ✗ Error generating instructions for form {form_id}: {e}")
            # skip adding trainingTasks if generation fails
            continue

        # Build trainingTasks array
        training_tasks = []
        for i in range(tasks_per_form):
            training_tasks.append({
                "id": f"task_{i+1}",
                "instruction": instructions[i],
                "masked": mask_flags[i],
                "maskedFields": masked_fields_per_task[i],
            })

        form["trainingTasks"] = training_tasks
        source_dict[form_id] = form

        print(f"  ✓ Added trainingTasks (5) to form {form_id}")
        masked_count = sum(mask_flags)
        if masked_count:
            print(f"    Masked tasks in this form: {masked_count} (global masked fields: {masked_fields_per_task})")

    # ---- Save back configs ----
    os.makedirs("public", exist_ok=True)

    with open(manual_config_file, "w", encoding="utf-8") as f:
        json.dump(manual_config, f, indent=2, ensure_ascii=False)
    print(f"\nSaved updated manual forms to {manual_config_file}")

    with open(llm_config_file, "w", encoding="utf-8") as f:
        json.dump(llm_config, f, indent=2, ensure_ascii=False)
    print(f"Saved updated LLM forms to {llm_config_file}")

    print("\nAll done. Each form now has a trainingTasks array with 5 tasks.")
    print("All tasks share the same groundTruth values; ~10% of tasks have masked fields.")


if __name__ == "__main__":
    main()
