import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

// Mock data for engagement analytics
const engagementData = [
  { name: "May 15", likes: 42, comments: 7, shares: 12 },
  { name: "May 16", likes: 38, comments: 5, shares: 8 },
  { name: "May 17", likes: 56, comments: 12, shares: 15 },
  { name: "May 18", likes: 45, comments: 9, shares: 11 },
  { name: "May 19", likes: 67, comments: 14, shares: 19 },
  { name: "May 20", likes: 62, comments: 11, shares: 16 },
  { name: "May 21", likes: 78, comments: 18, shares: 22 },
];

// Mock data for platform breakdown
const platformData = [
  { name: "Twitter", value: 45, color: "#1DA1F2" },
  { name: "Facebook", value: 25, color: "#4267B2" },
  { name: "LinkedIn", value: 20, color: "#0077B5" },
  { name: "Instagram", value: 10, color: "#E1306C" },
];

// Mock data for audience demographics
const demographicsData = [
  { name: "18-24", value: 15 },
  { name: "25-34", value: 35 },
  { name: "35-44", value: 25 },
  { name: "45-54", value: 15 },
  { name: "55+", value: 10 },
];

// Mock data for post performance
const postPerformanceData = [
  { id: 1, title: "New CRM features announcement", engagement: 120, platform: "Twitter" },
  { id: 2, title: "Customer success story: XYZ Corp", engagement: 95, platform: "LinkedIn" },
  { id: 3, title: "Upcoming webinar announcement", engagement: 78, platform: "Facebook" },
  { id: 4, title: "Product update: Social media integration", engagement: 145, platform: "Twitter" },
  { id: 5, title: "Team spotlight: Meet our developers", engagement: 68, platform: "Instagram" },
];

export default function AnalyticsTab() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  const [platform, setPlatform] = useState<string>("all");
  const [metric, setMetric] = useState<string>("engagement");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="reach">Reach</SelectItem>
            <SelectItem value="clicks">Clicks</SelectItem>
            <SelectItem value="conversions">Conversions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="posts">Post Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={engagementData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="shares" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={demographicsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Percentage">
                    {demographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={postPerformanceData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#8884d8">
                    {postPerformanceData.map((entry, index) => {
                      let color;
                      switch(entry.platform) {
                        case "Twitter": color = "#1DA1F2"; break;
                        case "Facebook": color = "#4267B2"; break;
                        case "LinkedIn": color = "#0077B5"; break;
                        case "Instagram": color = "#E1306C"; break;
                        default: color = "#8884d8";
                      }
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">Campaign analytics will be available once campaigns are running.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}