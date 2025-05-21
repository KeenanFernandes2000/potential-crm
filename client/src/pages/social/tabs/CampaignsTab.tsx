import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Calendar, DollarSign, Clock, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

type SocialCampaign = {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  targetAudience?: {
    demographics?: string[];
    interests?: string[];
    locations?: string[];
  };
  progress: number;
};

const mockCampaigns: SocialCampaign[] = [
  {
    id: 1,
    name: "Summer Product Launch",
    description: "Campaign for our new summer product line featuring social media posts across all platforms",
    status: "Active",
    startDate: new Date(2025, 4, 15),
    endDate: new Date(2025, 6, 15),
    budget: 2500,
    targetAudience: {
      demographics: ["25-34", "35-44"],
      interests: ["Technology", "Business Software"],
      locations: ["United States", "Canada", "Europe"]
    },
    progress: 45
  },
  {
    id: 2,
    name: "Customer Testimonials",
    description: "Series of customer testimonials and success stories for social media",
    status: "Planned",
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 30),
    budget: 1000,
    targetAudience: {
      demographics: ["25-55"],
      interests: ["CRM", "Business Management"],
      locations: ["Global"]
    },
    progress: 0
  },
  {
    id: 3,
    name: "Q2 Webinar Promotion",
    description: "Promotion for our upcoming Q2 webinar on advanced CRM features",
    status: "Active",
    startDate: new Date(2025, 4, 10),
    endDate: new Date(2025, 5, 5),
    budget: 1500,
    targetAudience: {
      demographics: ["25-55"],
      interests: ["CRM", "Sales", "Marketing"],
      locations: ["United States", "United Kingdom", "Australia"]
    },
    progress: 75
  },
  {
    id: 4,
    name: "Holiday Special Offer",
    description: "End-of-year promotion with special pricing and offers",
    status: "Completed",
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2024, 11, 31),
    budget: 3000,
    targetAudience: {
      demographics: ["All"],
      interests: ["Business Software", "CRM"],
      locations: ["Global"]
    },
    progress: 100
  },
];

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>(mockCampaigns);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Planned":
        return "secondary";
      case "Paused":
        return "warning";
      case "Completed":
        return "default";
      default:
        return "default";
    }
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{campaign.name}</CardTitle>
                <CardDescription className="mt-1">{campaign.description}</CardDescription>
              </div>
              <Badge variant={getStatusColor(campaign.status) as any}>
                {campaign.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(campaign.startDate, "MMM d, yyyy")} - {format(campaign.endDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Budget: {formatBudget(campaign.budget)}</span>
                </div>
                {campaign.targetAudience && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Target Audience:</p>
                      {campaign.targetAudience.demographics && (
                        <p className="text-xs">Demographics: {campaign.targetAudience.demographics.join(", ")}</p>
                      )}
                      {campaign.targetAudience.interests && (
                        <p className="text-xs">Interests: {campaign.targetAudience.interests.join(", ")}</p>
                      )}
                      {campaign.targetAudience.locations && (
                        <p className="text-xs">Locations: {campaign.targetAudience.locations.join(", ")}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Campaign Progress: {campaign.progress}%</p>
                <Progress value={campaign.progress} className="h-2" />
                {campaign.status === "Active" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive flex items-center gap-1">
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}