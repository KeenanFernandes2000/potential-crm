import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Deal, dealStageEnum } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList } from "recharts";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");

  // Fetch deals data
  const { data: deals, isLoading: isDealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  // Calculate deal metrics by stage
  const dealsByStage = isDealsLoading || !deals
    ? []
    : Object.values(dealStageEnum.enumValues).map(stage => {
        const stageDeals = deals.filter(deal => deal.stage === stage);
        const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const count = stageDeals.length;
        
        return {
          stage,
          count,
          value: totalValue,
          formattedValue: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(totalValue)
        };
      });

  // Custom colors for the funnel chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444'];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      
      <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Funnel</CardTitle>
              <CardDescription>
                Value of deals at each stage of the sales pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isDealsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading sales data...</p>
                  </div>
                ) : dealsByStage.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p>No deals data available. Add some deals to see the funnel.</p>
                  </div>
                ) : (
                  <div className="relative h-full flex flex-col justify-center items-center">
                    {dealsByStage.filter(item => item.value > 0).map((stage, index) => {
                      const maxValue = Math.max(...dealsByStage.map(s => s.value));
                      const percentage = (stage.value / maxValue) * 100;
                      const width = Math.max(percentage, 15); // Minimum 15% width for visibility
                      
                      return (
                        <div key={stage.stage} className="relative w-full flex justify-center mb-2">
                          <div 
                            className="relative flex items-center justify-between px-6 py-4 text-white font-semibold"
                            style={{
                              width: `${width}%`,
                              background: COLORS[index % COLORS.length],
                              clipPath: index === 0 
                                ? 'polygon(10% 0%, 90% 0%, 85% 100%, 15% 100%)' // Top trapezoid
                                : index === dealsByStage.filter(item => item.value > 0).length - 1
                                ? 'polygon(15% 0%, 85% 0%, 90% 100%, 10% 100%)' // Bottom trapezoid  
                                : 'polygon(15% 0%, 85% 0%, 85% 100%, 15% 100%)', // Middle rectangle
                              minHeight: '60px'
                            }}
                          >
                            <span className="text-sm font-medium">{stage.stage}</span>
                            <span className="text-sm font-bold">{stage.formattedValue}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deal Count by Stage</CardTitle>
                <CardDescription>
                  Number of deals in each stage of the pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isDealsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading sales data...</p>
                    </div>
                  ) : dealsByStage.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p>No deals data available.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dealsByStage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" name="Deal Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Deal Value Distribution</CardTitle>
                <CardDescription>
                  Distribution of deal value across different stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isDealsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading sales data...</p>
                    </div>
                  ) : dealsByStage.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p>No deals data available.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dealsByStage.filter(item => item.value > 0)}
                          dataKey="value"
                          nameKey="stage"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        >
                          {dealsByStage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns Performance</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <p>Marketing analytics will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Growth</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <p>Contact analytics will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;