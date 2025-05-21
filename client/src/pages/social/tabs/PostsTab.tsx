import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit, Trash, ExternalLink, Heart, MessageCircle, Repeat } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

type SocialPost = {
  id: number;
  accountId: number;
  accountName: string;
  platform: string;
  content: string;
  mediaUrls: string[];
  status: string;
  scheduledFor?: Date;
  publishedAt?: Date;
  engagementStats?: {
    likes: number;
    comments: number;
    shares: number;
  };
};

const mockPosts: SocialPost[] = [
  {
    id: 1,
    accountId: 1,
    accountName: "@potential_crm",
    platform: "Twitter",
    content: "Exciting news! We've just released our latest CRM update with powerful new social media management features. Check it out now! #CRM #SocialMedia",
    mediaUrls: [],
    status: "Published",
    publishedAt: new Date(2025, 4, 15, 14, 30),
    engagementStats: {
      likes: 42,
      comments: 7,
      shares: 12
    }
  },
  {
    id: 2,
    accountId: 2,
    accountName: "Potential CRM",
    platform: "LinkedIn",
    content: "We're excited to announce our new partnership with TechCorp to bring enhanced analytics capabilities to our CRM platform. Stay tuned for more updates!",
    mediaUrls: [],
    status: "Scheduled",
    scheduledFor: new Date(2025, 4, 25, 10, 0),
  },
  {
    id: 3,
    accountId: 3,
    accountName: "Potential CRM",
    platform: "Facebook",
    content: "Looking to streamline your sales process? Join our webinar next week to learn how our CRM can help you close more deals in less time.",
    mediaUrls: [],
    status: "Draft",
  },
  {
    id: 4,
    accountId: 1,
    accountName: "@potential_crm",
    platform: "Twitter",
    content: "Our customer support team is now available 24/7! Contact us anytime for assistance with your CRM implementation.",
    mediaUrls: [],
    status: "Published",
    publishedAt: new Date(2025, 4, 10, 9, 15),
    engagementStats: {
      likes: 28,
      comments: 3,
      shares: 5
    }
  },
];

export default function PostsTab() {
  const [posts, setPosts] = useState<SocialPost[]>(mockPosts);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "success";
      case "Scheduled":
        return "warning";
      case "Draft":
        return "secondary";
      case "Failed":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{post.platform[0]}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-md">{post.accountName}</CardTitle>
                <CardDescription className="text-sm">· {post.platform}</CardDescription>
              </div>
              <Badge variant={getStatusColor(post.status) as any}>
                {post.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
            
            {post.status === "Scheduled" && post.scheduledFor && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(post.scheduledFor, "MMM d, yyyy")}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{format(post.scheduledFor, "h:mm a")}</span>
              </div>
            )}
            
            {post.status === "Published" && post.publishedAt && post.engagementStats && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(post.publishedAt, "MMM d, yyyy")}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{format(post.publishedAt, "h:mm a")}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{post.engagementStats.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{post.engagementStats.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{post.engagementStats.shares}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive flex items-center gap-1">
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </div>
              {post.status === "Published" && (
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  View
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}