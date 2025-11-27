import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getAllFormsAsync, setUseLlmGenerated, getUseLlmGenerated } from "@/utils/form-config-loader";
import { FormDefinition } from "@/types/form-config";
import { FileText, Layers, Zap } from "lucide-react";

const Index = () => {
  const [useLlmGenerated, setUseLlmGeneratedState] = useState<boolean>(getUseLlmGenerated());
  const [filterType, setFilterType] = useState<string>("all");
  const [allForms, setAllForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load forms when toggle or filter changes
  useEffect(() => {
    const loadForms = async () => {
      setLoading(true);
      setUseLlmGenerated(useLlmGenerated);
      try {
        const forms = await getAllFormsAsync();
        setAllForms(forms);
      } catch (error) {
        console.error('Failed to load forms:', error);
        setAllForms([]);
      } finally {
        setLoading(false);
      }
    };
    loadForms();
  }, [useLlmGenerated]);

  const forms = filterType === "all" 
    ? allForms 
    : allForms.filter(form => form.type === filterType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'single-page':
        return 'bg-success/10 text-success border-success/20';
      case 'multipage':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'single-page':
        return <Zap className="w-4 h-4" />;
      case 'multipage':
        return <Layers className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Form Playground</h1>
          <p className="text-muted-foreground text-lg">
            Testing environment for AI form-filling systems
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex flex-col gap-4 mb-6">
            {/* Toggle for LLM Generated vs Manual */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-3">
                <Switch
                  id="llm-toggle"
                  checked={useLlmGenerated}
                  onCheckedChange={setUseLlmGeneratedState}
                />
                <Label htmlFor="llm-toggle" className="text-base font-medium cursor-pointer">
                  {useLlmGenerated ? "LLM Generated Forms" : "Manual Forms"}
                </Label>
              </div>
              <Badge variant={useLlmGenerated ? "default" : "outline"}>
                {useLlmGenerated ? "AI Generated" : "Manual"}
              </Badge>
            </div>

            {/* Stats and Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <Zap className="w-3 h-3 mr-1" />
                  Single Page ({allForms.filter(f => f.type === 'single-page').length})
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Layers className="w-3 h-3 mr-1" />
                  Multipage ({allForms.filter(f => f.type === 'multipage').length})
                </Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Total ({allForms.length})
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="filter-type" className="text-sm font-medium text-muted-foreground">
                  Filter:
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter-type" className="w-[180px]">
                    <SelectValue placeholder="All Forms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forms</SelectItem>
                    <SelectItem value="single-page">Single Page</SelectItem>
                    <SelectItem value="multipage">Multipage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {useLlmGenerated 
                ? "No LLM generated forms available. Run generate_pages.py to generate forms."
                : "No forms available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-all duration-200 border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{form.title}</CardTitle>
                  {getTypeIcon(form.type)}
                </div>
                <CardDescription className="text-base">{form.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(form.type)}>
                    {form.type}
                  </Badge>
                  {form.pages.length > 1 && (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      {form.pages.length} pages
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  to={
                    form.type === 'multipage'
                      ? `/${form.id}/page/1`
                      : `/${form.id}`
                  }
                  className="w-full"
                >
                  <Button className="w-full" variant="default">
                    Fill Form
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
