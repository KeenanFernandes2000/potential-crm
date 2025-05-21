import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Instagram, Linkedin, Youtube, Edit, Trash } from "lucide-react";

type SocialAccount = {
  id: number;
  platform: string;
  accountName: string;
  accountUrl: string;
  active: boolean;
};

const mockAccounts: SocialAccount[] = [
  {
    id: 1,
    platform: "Twitter",
    accountName: "@potential_crm",
    accountUrl: "https://twitter.com/potential_crm",
    active: true,
  },
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
  const [accounts, setAccounts] = useState<SocialAccount[]>(mockAccounts);

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

  return (
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
  );
}