import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface FormData {
  gpa: string;
  major: string;
  essay1: string;
  essay2: string;
}

interface Props {
  data: FormData;
  onUpdate: (data: FormData) => void;
}

const ScholarshipApplicationPage2 = ({ data, onUpdate }: Props) => {
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/multipage-3/page/3");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Scholarship Application</CardTitle>
            <span className="text-sm text-muted-foreground">Page 2 of 3</span>
          </div>
          <CardDescription>Academic Information & Essays</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gpa">Current GPA</Label>
              <Input
                id="gpa"
                type="text"
                placeholder="3.85"
                value={data.gpa}
                onChange={(e) => onUpdate({ ...data, gpa: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study</Label>
              <Input
                id="major"
                type="text"
                value={data.major}
                onChange={(e) => onUpdate({ ...data, major: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="essay1">Essay 1: Why do you deserve this scholarship?</Label>
              <Textarea
                id="essay1"
                placeholder="Write your essay here..."
                value={data.essay1}
                onChange={(e) => onUpdate({ ...data, essay1: e.target.value })}
                required
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="essay2">Essay 2: Your future goals</Label>
              <Textarea
                id="essay2"
                placeholder="Write your essay here..."
                value={data.essay2}
                onChange={(e) => onUpdate({ ...data, essay2: e.target.value })}
                required
                rows={5}
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/multipage-3/page/1")} className="flex-1">
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

export default ScholarshipApplicationPage2;
