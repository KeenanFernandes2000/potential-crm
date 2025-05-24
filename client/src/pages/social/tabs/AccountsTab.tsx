import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Instagram, Linkedin, Youtube, Edit, Trash, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TwitterAccount {
  id: string;
  username: string;
  name: string;
  profileImageUrl: string;
  followersCount: number;
  followingCount: number;
  description: string;
}

type SocialAccount = {
  id: number;
  platform: string;
  accountName: string;
  accountUrl: string;
  active: boolean;
  details?: TwitterAccount;
};

// Other social media accounts as fallback if Twitter isn't connected
const otherAccounts: SocialAccount[] = [
  {
    id: 2,
    platform: "Facebook",
    accountName: "Potential CRM",
    accountUrl: "https://facebook.com/potentialcrm",
    active: true,
  },
  {
    id: 3,
    platform: "LinkedIn",
    accountName: "Potential CRM",
    accountUrl: "https://linkedin.com/company/potentialcrm",
    active: true,
  },
  {
    id: 4,
    platform: "Instagram",
    accountName: "@potentialcrm",
    accountUrl: "https://instagram.com/potentialcrm",
    active: false,
  },
];

export default function AccountsTab() {
  // Initialize with empty array, will be populated from Twitter API or fallback accounts
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  
  // Fetch Twitter account info
  const { data: twitterAccount, isLoading, error } = useQuery<TwitterAccount>({ 
    queryKey: ['/api/twitter/account'],
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Combine real Twitter account with other pre-configured accounts
    const allAccounts: SocialAccount[] = [...otherAccounts];
    
    if (twitterAccount && 'username' in twitterAccount) {
      const twitterAccountEntry: SocialAccount = {
        id: 1,
        platform: "Twitter",
        accountName: `@${twitterAccount.username}`,
        accountUrl: `https://twitter.com/${twitterAccount.username}`,
        active: true,
        details: twitterAccount as TwitterAccount
      };
      
      // Add Twitter account at the beginning of the list
      allAccounts.unshift(twitterAccountEntry);
    }
    
    setAccounts(allAccounts);
  }, [twitterAccount]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return <Twitter className="h-5 w-5 text-blue-400" />;
      case "Facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case "Instagram":
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case "LinkedIn":
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      case "YouTube":
        return <Youtube className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading social accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to connect to Twitter</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>There was an error connecting to your Twitter account. This could be due to:</p>
            <ul className="list-disc pl-5">
              <li>Expired or invalid API credentials</li>
              <li>Recent Twitter API changes requiring updated credentials</li>
              <li>Network connectivity issues</li>
            </ul>
            <p className="pt-2">
              Please check your Twitter API credentials (API key, API secret, Access token, Access secret) in your environment variables.
            </p>
          </AlertDescription>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(account.platform)}
                  <CardTitle className="text-lg">{account.platform}</CardTitle>
                </div>
                <Badge variant={account.active ? "default" : "secondary"}>
                  {account.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription className="mt-2">
                <a href={account.accountUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {account.accountName}
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {account.details && (
                <div className="mb-4 text-sm">
                  <p className="text-muted-foreground mb-2">{account.details.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{account.details.followersCount.toLocaleString()} followers</span>
                    <span>{account.details.followingCount.toLocaleString()} following</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive flex items-center gap-1">
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}