import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MessageSquare, BarChart2, Calendar } from "lucide-react";

import AccountsTab from "./tabs/AccountsTab";
import PostsTab from "./tabs/PostsTab";
import CampaignsTab from "./tabs/CampaignsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Social Media</h1>
        <p className="text-muted-foreground">
          Manage your social media accounts, create posts, and track analytics.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Social Media Management</CardTitle>
          <CardDescription>
            Connect your social media accounts, schedule posts, and run campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="accounts" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="accounts" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Accounts</span>
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts">
              <AccountsTab />
            </TabsContent>
            
            <TabsContent value="posts">
              <PostsTab />
            </TabsContent>
            
            <TabsContent value="campaigns">
              <CampaignsTab />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}