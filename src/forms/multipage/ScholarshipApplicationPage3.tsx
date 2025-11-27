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

const ScholarshipApplicationPage3 = ({ onSubmit }: Props) => {
  const [transcript, setTranscript] = useState<File | null>(null);
  const [recommendation, setRecommendation] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Scholarship application submitted successfully!");
    console.log("Scholarship Application submitted");
    onSubmit();
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Scholarship Application</CardTitle>
            <span className="text-sm text-muted-foreground">Page 3 of 3</span>
          </div>
          <CardDescription>Supporting Documents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="transcript">Academic Transcript</Label>
              <input
                id="transcript"
                type="file"
                onChange={(e) => setTranscript(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("transcript")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {transcript ? transcript.name : "Upload Transcript"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendation">Letter of Recommendation</Label>
              <input
                id="recommendation"
                type="file"
                onChange={(e) => setRecommendation(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("recommendation")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {recommendation ? recommendation.name : "Upload Recommendation"}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/multipage-3/page/2")} className="flex-1">
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

export default ScholarshipApplicationPage3;
