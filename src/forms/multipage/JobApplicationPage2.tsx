import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface FormData {
  position: string;
  experience: string;
  skills: string;
}

interface Props {
  data: FormData;
  onUpdate: (data: FormData) => void;
}

const JobApplicationPage2 = ({ data, onUpdate }: Props) => {
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/multipage-1/page/3");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Job Application</CardTitle>
            <span className="text-sm text-muted-foreground">Page 2 of 3</span>
          </div>
          <CardDescription>Experience & Skills</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="position">Position Applied For</Label>
              <Input
                id="position"
                type="text"
                value={data.position}
                onChange={(e) => onUpdate({ ...data, position: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Work Experience</Label>
              <Textarea
                id="experience"
                placeholder="Describe your relevant work experience..."
                value={data.experience}
                onChange={(e) => onUpdate({ ...data, experience: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Key Skills</Label>
              <Textarea
                id="skills"
                placeholder="List your key skills..."
                value={data.skills}
                onChange={(e) => onUpdate({ ...data, skills: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/multipage-1/page/1")} className="flex-1">
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

export default JobApplicationPage2;
