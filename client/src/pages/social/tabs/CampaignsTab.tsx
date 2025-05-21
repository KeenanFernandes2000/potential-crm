import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  PlusCircle, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  BarChart, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

type Campaign = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed' | 'planned';
  platforms: string[];
  postCount: number;
  metrics?: {
    impressions: number;
    engagements: number;
    clicks: number;
    conversions: number;
  };
};

// Sample campaigns for display purposes
const sampleCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Summer Sale Promotion",
    description: "Promotional campaign for our annual summer sale",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    status: "planned",
    platforms: ["Twitter", "Facebook", "Instagram"],
    postCount: 12,
    metrics: {
      impressions: 0,
      engagements: 0,
      clicks: 0,
      conversions: 0,
    },
  },
  {
    id: 2,
    name: "Product Launch: CRM Pro",
    description: "Campaign for our new premium CRM features",
    startDate: "2025-05-15",
    endDate: "2025-05-30",
    status: "active",
    platforms: ["Twitter", "LinkedIn"],
    postCount: 8,
    metrics: {
      impressions: 34250,
      engagements: 2105,
      clicks: 946,
      conversions: 124,
    },
  },
  {
    id: 3,
    name: "Industry Conference",
    description: "Live updates and engagement from the annual tech conference",
    startDate: "2025-04-10",
    endDate: "2025-04-12",
    status: "completed",
    platforms: ["Twitter", "LinkedIn"],
    postCount: 15,
    metrics: {
      impressions: 28750,
      engagements: 3240,
      clicks: 1203,
      conversions: 89,
    },
  },
];

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(sampleCampaigns);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return <Twitter className="h-4 w-4 text-blue-400" />;
      case "Facebook":
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case "Instagram":
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case "LinkedIn":
        return <Linkedin className="h-4 w-4 text-blue-700" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "paused":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Paused</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "planned":
        return <Badge variant="outline">Planned</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "paused":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
      case "planned":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Social Media Campaigns</h3>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                {getStatusBadge(campaign.status)}
              </div>
              <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(campaign.status)}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {campaign.platforms.map((platform) => (
                    <div key={platform} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                      {getPlatformIcon(platform)}
                      <span>{platform}</span>
                    </div>
                  ))}
                </div>

                {campaign.status !== 'planned' && campaign.metrics && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted p-2 rounded-lg">
                      <div className="text-muted-foreground">Impressions</div>
                      <div className="font-semibold">{campaign.metrics.impressions.toLocaleString()}</div>
                    </div>
                    <div className="bg-muted p-2 rounded-lg">
                      <div className="text-muted-foreground">Engagements</div>
                      <div className="font-semibold">{campaign.metrics.engagements.toLocaleString()}</div>
                    </div>
                    <div className="bg-muted p-2 rounded-lg">
                      <div className="text-muted-foreground">Clicks</div>
                      <div className="font-semibold">{campaign.metrics.clicks.toLocaleString()}</div>
                    </div>
                    <div className="bg-muted p-2 rounded-lg">
                      <div className="text-muted-foreground">Conversions</div>
                      <div className="font-semibold">{campaign.metrics.conversions.toLocaleString()}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-muted-foreground">{campaign.postCount} posts</span>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium">No Campaigns</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You don't have any social media campaigns yet. Create your first campaign to schedule and manage posts across multiple platforms.
            </p>
            <Button className="mt-2">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}