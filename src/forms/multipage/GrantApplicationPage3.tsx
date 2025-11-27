import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface FormData {
  objectives: string;
  methodology: string;
  impact: string;
}

interface Props {
  data: FormData;
  onUpdate: (data: FormData) => void;
}

const GrantApplicationPage3 = ({ data, onUpdate }: Props) => {
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/multipage-2/page/4");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Grant Application</CardTitle>
            <span className="text-sm text-muted-foreground">Page 3 of 4</span>
          </div>
          <CardDescription>Project Details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="objectives">Project Objectives</Label>
              <Textarea
                id="objectives"
                placeholder="List your project objectives..."
                value={data.objectives}
                onChange={(e) => onUpdate({ ...data, objectives: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="methodology">Methodology</Label>
              <Textarea
                id="methodology"
                placeholder="Describe your project methodology..."
                value={data.methodology}
                onChange={(e) => onUpdate({ ...data, methodology: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="impact">Expected Impact</Label>
              <Textarea
                id="impact"
                placeholder="Describe the expected impact..."
                value={data.impact}
                onChange={(e) => onUpdate({ ...data, impact: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/multipage-2/page/2")} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">Next</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrantApplicationPage3;
