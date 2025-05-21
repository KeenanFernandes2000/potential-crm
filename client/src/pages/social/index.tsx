import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AccountsTab from "./tabs/AccountsTab";
import PostsTab from "./tabs/PostsTab";
import CampaignsTab from "./tabs/CampaignsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";

export default function SocialMedia() {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Social Media</h1>
          <p className="text-muted-foreground">Manage your social media accounts, posts, and campaigns</p>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {activeTab === "accounts" && (
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          )}
          
          {activeTab === "posts" && (
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          )}
          
          {activeTab === "campaigns" && (
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          )}
        </div>
        
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
    </div>
  );
}