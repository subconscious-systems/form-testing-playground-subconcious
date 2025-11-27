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

const JobApplicationPage3 = ({ onSubmit }: Props) => {
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Job application submitted successfully!");
    console.log("Job Application submitted");
    onSubmit();
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Job Application</CardTitle>
            <span className="text-sm text-muted-foreground">Page 3 of 3</span>
          </div>
          <CardDescription>Upload Documents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume/CV</Label>
              <input
                id="resume"
                type="file"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("resume")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {resume ? resume.name : "Upload Resume"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <input
                id="coverLetter"
                type="file"
                onChange={(e) => setCoverLetter(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("coverLetter")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {coverLetter ? coverLetter.name : "Upload Cover Letter (Optional)"}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/multipage-1/page/2")} className="flex-1">
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

export default JobApplicationPage3;
