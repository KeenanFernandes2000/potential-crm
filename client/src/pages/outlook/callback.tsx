import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

const OutlookCallback = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');

    if (sessionToken) {
      // Store the session token in localStorage
      localStorage.setItem('microsoft_session_token', sessionToken);
      
      // Navigate to the mail page after a short delay to show success state
      setTimeout(() => {
        setLocation('/outlook/mail');
      }, 1500);
    } else {
      // If no session token, redirect back to main outlook page
      setTimeout(() => {
        setLocation('/outlook');
      }, 2000);
    }
  }, [setLocation]);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Authentication Successful</CardTitle>
            <CardDescription>
              Processing your Microsoft authentication...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Redirecting to your inbox...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OutlookCallback; 