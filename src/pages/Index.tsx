import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllFormsAsync } from "@/utils/form-config-loader";
import { FormDefinition } from "@/types/form-config";
import { FileText, Layers, Zap } from "lucide-react";

const Index = () => {
  // Load filter preference from localStorage on mount
  const [filterType, setFilterType] = useState<string>(() => {
    const saved = localStorage.getItem('form-playground-filter-preference');
    return saved || "all";
  });
  const [allForms, setAllForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Save filter preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('form-playground-filter-preference', filterType);
  }, [filterType]);

  // Load forms on mount
  useEffect(() => {
    const loadForms = async () => {
      setLoading(true);
      try {
        const forms = await getAllFormsAsync();
        setAllForms(forms);
      } catch (error) {
        setAllForms([]);
      } finally {
        setLoading(false);
      }
    };
    loadForms();
  }, []);

  const forms = filterType === "all" 
    ? allForms 
    : allForms.filter(form => form.type === filterType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'single-page':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'multipage':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
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
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Subconcious Form Playground</h1>
          <p className="text-gray-600 text-lg">
            Testing environment for AI form-filling systems
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex flex-col gap-4 mb-6">
            {/* Stats and Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              <Zap className="w-3 h-3 mr-1" />
                  Single Page ({allForms.filter(f => f.type === 'single-page').length})
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              <Layers className="w-3 h-3 mr-1" />
                  Multipage ({allForms.filter(f => f.type === 'multipage').length})
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
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
            <p className="text-muted-foreground">No forms available.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-all duration-200 border-gray-200 bg-white">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900">{form.title}</CardTitle>
                    <p className="text-xs text-gray-400 mt-1 font-mono">ID: {form.id}</p>
                  </div>
                  {getTypeIcon(form.type)}
                </div>
                <CardDescription className="text-base text-gray-600">{form.description}</CardDescription>
              </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={getTypeColor(form.type)}>
                      {form.type}
                    </Badge>
                    {form.pages.length > 1 && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        {form.pages.length} pages
                      </Badge>
                    )}
                    {form.layout && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        {form.layout.replace('-', ' ')}
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
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" variant="default">
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
