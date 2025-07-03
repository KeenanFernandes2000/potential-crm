import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mailbox, ExternalLink } from "lucide-react";

const OutlookPage = () => {
  const handleMicrosoftLogin = () => {
    window.location.href = "http://localhost:8000/microsoft/auth/login";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Outlook Integration</h1>
        <p className="text-gray-600">Connect your Microsoft Outlook account to manage emails within your CRM</p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Mailbox className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Connect Outlook</CardTitle>
            <CardDescription>
              Sign in with your Microsoft account to access your Outlook emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleMicrosoftLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Log in with Microsoft
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OutlookPage; 