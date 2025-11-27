import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface FormData {
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface Props {
  data: FormData;
  onUpdate: (data: FormData) => void;
}

const GrantApplicationPage1 = ({ data, onUpdate }: Props) => {
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/multipage-2/page/2");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Grant Application</CardTitle>
            <span className="text-sm text-muted-foreground">Page 1 of 4</span>
          </div>
          <CardDescription>Organization Information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                type="text"
                value={data.organizationName}
                onChange={(e) => onUpdate({ ...data, organizationName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                type="text"
                value={data.contactPerson}
                onChange={(e) => onUpdate({ ...data, contactPerson: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onUpdate({ ...data, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => onUpdate({ ...data, phone: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
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

export default GrantApplicationPage1;
