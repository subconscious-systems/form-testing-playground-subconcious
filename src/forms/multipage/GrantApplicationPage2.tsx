import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface FormData {
  projectTitle: string;
  fundingAmount: string;
  projectSummary: string;
}

interface Props {
  data: FormData;
  onUpdate: (data: FormData) => void;
}

const GrantApplicationPage2 = ({ data, onUpdate }: Props) => {
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/multipage-2/page/3");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Grant Application</CardTitle>
            <span className="text-sm text-muted-foreground">Page 2 of 4</span>
          </div>
          <CardDescription>Project Overview</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectTitle">Project Title</Label>
              <Input
                id="projectTitle"
                type="text"
                value={data.projectTitle}
                onChange={(e) => onUpdate({ ...data, projectTitle: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundingAmount">Requested Funding Amount</Label>
              <Input
                id="fundingAmount"
                type="text"
                placeholder="$50,000"
                value={data.fundingAmount}
                onChange={(e) => onUpdate({ ...data, fundingAmount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectSummary">Project Summary</Label>
              <Textarea
                id="projectSummary"
                placeholder="Provide a brief summary of your project..."
                value={data.projectSummary}
                onChange={(e) => onUpdate({ ...data, projectSummary: e.target.value })}
                required
                rows={5}
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/multipage-2/page/1")} className="flex-1">
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

export default GrantApplicationPage2;
