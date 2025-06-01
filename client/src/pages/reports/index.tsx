import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Deal, dealStageEnum, Contact, Company } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");

  // Fetch deals data
  const { data: deals, isLoading: isDealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  // Fetch contacts data
  const { data: contacts, isLoading: isContactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Fetch companies data  
  const { data: companies, isLoading: isCompaniesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
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

  // Calculate geographic distribution of deals
  const dealsByCountry = isDealsLoading || isContactsLoading || isCompaniesLoading || !deals || !contacts || !companies
    ? []
    : (() => {
        const countryData: { [country: string]: { count: number; value: number; deals: Deal[] } } = {};
        
        deals.forEach(deal => {
          let country = 'Unknown';
          
          // Try to get country from associated company
          if (deal.companyId) {
            const company = companies.find(c => c.id === deal.companyId);
            if (company?.country) {
              country = company.country;
            }
          }
          
          // Try to get country from associated contact if company doesn't have it
          if (country === 'Unknown' && deal.contactId) {
            const contact = contacts.find(c => c.id === deal.contactId);
            if (contact?.country) {
              country = contact.country;
            }
          }
          
          if (!countryData[country]) {
            countryData[country] = { count: 0, value: 0, deals: [] };
          }
          
          countryData[country].count += 1;
          countryData[country].value += deal.value || 0;
          countryData[country].deals.push(deal);
        });
        
        return Object.entries(countryData).map(([country, data]) => ({
          country,
          count: data.count,
          value: data.value,
          deals: data.deals,
          formattedValue: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(data.value)
        })).sort((a, b) => b.value - a.value);
      })();

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
              <CardTitle>Geographic Deal Distribution</CardTitle>
              <CardDescription>
                Deal distribution by country with value and count visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isDealsLoading || isContactsLoading || isCompaniesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading geographic data...</p>
                  </div>
                ) : dealsByCountry.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p>No geographic data available. Add countries to your contacts and companies to see the distribution.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* World Map Visualization */}
                    <div className="relative">
                      <h3 className="text-lg font-semibold mb-4">World Map</h3>
                      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 h-[320px] overflow-hidden">
                        {/* Simplified world map representation */}
                        <svg viewBox="0 0 800 400" className="w-full h-full">
                          {/* Background */}
                          <rect width="800" height="400" fill="currentColor" className="text-blue-100 dark:text-blue-900/30" />
                          
                          {/* Continents - simplified shapes */}
                          <g className="text-gray-300 dark:text-gray-600" fill="currentColor">
                            {/* North America */}
                            <path d="M100,80 L200,70 L220,120 L180,180 L120,160 Z" />
                            {/* South America */}
                            <path d="M150,200 L180,190 L190,280 L160,320 L140,280 Z" />
                            {/* Europe */}
                            <path d="M380,80 L420,75 L430,120 L400,140 L370,130 Z" />
                            {/* Africa */}
                            <path d="M380,140 L420,135 L440,240 L400,280 L360,240 Z" />
                            {/* Asia */}
                            <path d="M440,60 L650,55 L680,180 L620,200 L450,190 Z" />
                            {/* Australia */}
                            <path d="M600,250 L680,245 L690,280 L650,290 L600,285 Z" />
                          </g>
                          
                          {/* Country indicators */}
                          {dealsByCountry.slice(0, 10).map((country, index) => {
                            const maxValue = dealsByCountry[0]?.value || 1;
                            const intensity = (country.value / maxValue);
                            const size = Math.max(8, intensity * 20);
                            
                            // Simple positioning for demonstration - in real app would use proper coordinates
                            const positions = [
                              { x: 160, y: 120, name: "USA" },
                              { x: 400, y: 110, name: "Germany" },
                              { x: 500, y: 130, name: "India" },
                              { x: 600, y: 120, name: "China" },
                              { x: 410, y: 100, name: "UK" },
                              { x: 430, y: 95, name: "France" },
                              { x: 550, y: 110, name: "Japan" },
                              { x: 165, y: 250, name: "Brazil" },
                              { x: 640, y: 265, name: "Australia" },
                              { x: 520, y: 140, name: "Singapore" }
                            ];
                            
                            const position = positions.find(p => 
                              p.name.toLowerCase() === country.country.toLowerCase()
                            ) || positions[index % positions.length];
                            
                            return (
                              <g key={country.country}>
                                <circle
                                  cx={position.x}
                                  cy={position.y}
                                  r={size}
                                  fill={COLORS[index % COLORS.length]}
                                  opacity={0.8}
                                  className="cursor-pointer hover:opacity-100"
                                />
                                <text
                                  x={position.x}
                                  y={position.y - size - 5}
                                  textAnchor="middle"
                                  className="text-xs font-semibold fill-gray-700 dark:fill-gray-300"
                                >
                                  {country.country}
                                </text>
                                <text
                                  x={position.x}
                                  y={position.y + size + 15}
                                  textAnchor="middle"
                                  className="text-xs fill-gray-600 dark:fill-gray-400"
                                >
                                  {country.count} deals
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                    
                    {/* Country Statistics */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Deal Statistics by Country</h3>
                      <div className="space-y-3 max-h-[320px] overflow-y-auto">
                        {dealsByCountry.map((country, index) => (
                          <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium">{country.country}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{country.formattedValue}</div>
                              <div className="text-sm text-gray-500">{country.count} deals</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
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
                  <div className="relative h-full flex justify-center items-center">
                    <div className="flex flex-col justify-center items-center w-2/3">
                      {dealsByStage.filter(item => item.value > 0).map((stage, index) => {
                        const maxValue = Math.max(...dealsByStage.map(s => s.value));
                        const percentage = (stage.value / maxValue) * 100;
                        const width = Math.max(percentage, 15); // Minimum 15% width for visibility
                        
                        return (
                          <div key={stage.stage} className="relative w-full flex justify-center mb-2">
                            <div 
                              className="relative"
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
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col justify-center ml-8 space-y-2">
                      {dealsByStage.filter(item => item.value > 0).map((stage, index) => (
                        <div key={stage.stage} className="flex items-center justify-between min-h-[60px] mb-2">
                          <span className="text-sm font-semibold text-black mr-8">{stage.stage}</span>
                          <span className="text-sm font-bold text-black">{stage.formattedValue}</span>
                        </div>
                      ))}
                    </div>
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