import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface Props {
  onSubmit: () => void;
}

const GrantApplicationPage4 = ({ onSubmit }: Props) => {
  const [budget, setBudget] = useState<File | null>(null);
  const [proposal, setProposal] = useState<File | null>(null);
  const [supporting, setSupporting] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Grant application submitted successfully!");
    console.log("Grant Application submitted");
    onSubmit();
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Grant Application</CardTitle>
            <span className="text-sm text-muted-foreground">Page 4 of 4</span>
          </div>
          <CardDescription>Supporting Documents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Document</Label>
              <input
                id="budget"
                type="file"
                onChange={(e) => setBudget(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("budget")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {budget ? budget.name : "Upload Budget"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal">Full Proposal</Label>
              <input
                id="proposal"
                type="file"
                onChange={(e) => setProposal(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("proposal")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {proposal ? proposal.name : "Upload Proposal"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supporting">Supporting Documents</Label>
              <input
                id="supporting"
                type="file"
                onChange={(e) => setSupporting(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("supporting")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {supporting ? supporting.name : "Upload Supporting Docs (Optional)"}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/multipage-2/page/3")} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrantApplicationPage4;
