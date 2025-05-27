import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  LineChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Analytics sample data
const engagementData = [
  { date: "May 01", Twitter: 156, Facebook: 98, Instagram: 75, LinkedIn: 45 },
  { date: "May 02", Twitter: 142, Facebook: 110, Instagram: 72, LinkedIn: 50 },
  { date: "May 03", Twitter: 187, Facebook: 115, Instagram: 70, LinkedIn: 61 },
  { date: "May 04", Twitter: 210, Facebook: 132, Instagram: 85, LinkedIn: 72 },
  { date: "May 05", Twitter: 205, Facebook: 125, Instagram: 92, LinkedIn: 68 },
  { date: "May 06", Twitter: 175, Facebook: 118, Instagram: 103, LinkedIn: 55 },
  { date: "May 07", Twitter: 189, Facebook: 105, Instagram: 110, LinkedIn: 63 },
  { date: "May 08", Twitter: 201, Facebook: 122, Instagram: 115, LinkedIn: 72 },
  { date: "May 09", Twitter: 215, Facebook: 138, Instagram: 120, LinkedIn: 85 },
  { date: "May 10", Twitter: 232, Facebook: 142, Instagram: 132, LinkedIn: 92 },
  { date: "May 11", Twitter: 245, Facebook: 158, Instagram: 135, LinkedIn: 98 },
  { date: "May 12", Twitter: 258, Facebook: 162, Instagram: 140, LinkedIn: 110 },
  { date: "May 13", Twitter: 267, Facebook: 175, Instagram: 152, LinkedIn: 115 },
  { date: "May 14", Twitter: 240, Facebook: 168, Instagram: 158, LinkedIn: 108 },
];

const followersData = [
  { date: "Jan", Twitter: 3450, Facebook: 4200, Instagram: 5100, LinkedIn: 2800 },
  { date: "Feb", Twitter: 3650, Facebook: 4350, Instagram: 5350, LinkedIn: 2950 },
  { date: "Mar", Twitter: 3800, Facebook: 4500, Instagram: 5600, LinkedIn: 3100 },
  { date: "Apr", Twitter: 4100, Facebook: 4800, Instagram: 6100, LinkedIn: 3300 },
  { date: "May", Twitter: 4350, Facebook: 5000, Instagram: 6500, LinkedIn: 3450 },
];

const postPerformanceData = [
  { category: "Engagement Rate", Product: 4.8, Industry: 3.5, Tips: 5.2, News: 4.1 },
  { category: "Clicks", Product: 342, Industry: 289, Tips: 408, News: 315 },
  { category: "Conversions", Product: 45, Industry: 32, Tips: 58, News: 39 },
  { category: "Shares", Product: 78, Industry: 65, Tips: 92, News: 71 },
];

type PlatformMetrics = {
  name: string;
  color: string;
  icon: JSX.Element;
  followerCount: number;
  engagementRate: number;
  postsLastWeek: number;
  topPost: {
    content: string;
    engagement: number;
  };
};

// Platform metrics will be populated from real social account data
const platformMetrics: PlatformMetrics[] = [];

export default function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState("14d");

  // Here we would integrate with the Twitter API to get real analytics
  // This is where we'd fetch Twitter analytics if expanding the integration
  const { data: twitterVerified } = useQuery({
    queryKey: ['/api/twitter/verify'],
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Social Media Analytics</h3>
        
        <Tabs defaultValue="14d" value={timeRange} onValueChange={setTimeRange} className="w-auto">
          <TabsList className="grid grid-cols-3 w-[200px]">
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="14d">14d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {platformMetrics.map((platform) => (
          <Card key={platform.name}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${platform.color}20` }}>
                  <div style={{ color: platform.color }}>{platform.icon}</div>
                </div>
                <div className="font-medium">{platform.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Followers</div>
                  <div className="font-semibold">{platform.followerCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Eng. Rate</div>
                  <div className="font-semibold">{platform.engagementRate}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Posts (Week)</div>
                  <div className="font-semibold">{platform.postsLastWeek}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={engagementData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Twitter" stroke="#1DA1F2" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Facebook" stroke="#4267B2" />
                  <Line type="monotone" dataKey="Instagram" stroke="#E1306C" />
                  <Line type="monotone" dataKey="LinkedIn" stroke="#0077B5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={followersData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Twitter" stackId="a" fill="#1DA1F2" />
                  <Bar dataKey="Facebook" stackId="a" fill="#4267B2" />
                  <Bar dataKey="Instagram" stackId="a" fill="#E1306C" />
                  <Bar dataKey="LinkedIn" stackId="a" fill="#0077B5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Performance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={postPerformanceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Product" fill="#8884d8" />
                <Bar dataKey="Industry" fill="#82ca9d" />
                <Bar dataKey="Tips" fill="#ffc658" />
                <Bar dataKey="News" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformMetrics.map((platform) => (
                <div key={`top-${platform.name}`} className="flex items-start gap-3 pb-3 border-b">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${platform.color}20` }}>
                    <div style={{ color: platform.color }}>{platform.icon}</div>
                  </div>
                  <div>
                    <div className="font-medium">{platform.name}</div>
                    <p className="text-sm text-muted-foreground my-1 line-clamp-2">{platform.topPost.content}</p>
                    <div className="text-xs text-muted-foreground">
                      {platform.topPost.engagement} engagements
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="font-medium text-amber-800">Post more frequently on Twitter</div>
                <p className="text-sm text-amber-700 mt-1">
                  Your Twitter engagement is 28% higher than other platforms. Consider increasing posting frequency for better results.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="font-medium text-blue-800">Optimize posting times</div>
                <p className="text-sm text-blue-700 mt-1">
                  Your content performs best when posted between 9-11am. Consider scheduling more posts during this timeframe.
                </p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="font-medium text-green-800">Content type analysis</div>
                <p className="text-sm text-green-700 mt-1">
                  "Tips" category content performs 35% better than other types. Create more educational content to increase engagement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}