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
                      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 h-[400px] overflow-hidden">
                        {/* Professional world map with deal overlays */}
                        <div className="relative w-full h-full">
                          <svg viewBox="0 0 1000 500" className="w-full h-full">
                            {/* Ocean background */}
                            <rect width="1000" height="500" fill="#a3d5ff" opacity="0.3" />
                            
                            {/* Detailed world map with accurate country shapes */}
                            <g fill="#e5e7eb" stroke="#ffffff" strokeWidth="0.8" className="dark:fill-gray-600">
                              {/* North America */}
                              <path d="M120,80 Q180,65 240,70 Q300,75 340,95 Q360,115 350,140 Q330,165 300,185 Q270,200 240,195 Q210,190 180,175 Q150,160 130,140 Q110,120 115,100 Q118,85 120,80 Z" />
                              {/* Mexico */}
                              <path d="M160,190 Q200,185 240,195 Q260,210 250,230 Q230,240 200,235 Q170,225 160,205 Q155,195 160,190 Z" />
                              {/* South America */}
                              <path d="M230,230 Q260,220 290,225 Q320,235 340,260 Q350,290 345,320 Q335,350 320,375 Q300,395 280,400 Q260,395 245,385 Q235,370 240,350 Q245,330 250,310 Q255,290 250,270 Q245,250 240,235 Q232,230 230,230 Z" />
                              {/* Europe */}
                              <path d="M480,100 Q510,95 540,105 Q565,115 575,135 Q570,155 555,165 Q535,170 515,165 Q495,155 485,140 Q480,125 485,110 Q482,105 480,100 Z" />
                              {/* Africa */}
                              <path d="M500,180 Q530,175 560,185 Q590,200 605,230 Q610,260 600,290 Q585,320 565,345 Q545,365 520,370 Q495,365 475,350 Q460,330 465,305 Q470,280 480,255 Q490,230 500,205 Q502,185 500,180 Z" />
                              {/* Asia */}
                              <path d="M580,90 Q630,85 680,95 Q730,105 780,115 Q820,125 850,145 Q860,165 850,185 Q835,205 815,215 Q790,220 765,215 Q740,205 715,195 Q690,185 665,175 Q640,165 615,155 Q590,145 585,125 Q582,105 580,90 Z" />
                              {/* China region */}
                              <path d="M680,135 Q720,130 760,140 Q785,150 800,170 Q795,190 775,200 Q750,205 725,195 Q700,185 685,170 Q675,155 680,140 Q678,137 680,135 Z" />
                              {/* India */}
                              <path d="M630,185 Q660,180 685,190 Q705,205 710,230 Q705,250 685,260 Q665,265 645,255 Q630,240 635,220 Q635,205 630,190 Q628,187 630,185 Z" />
                              {/* Australia */}
                              <path d="M780,330 Q810,325 840,335 Q860,350 865,370 Q860,385 840,395 Q815,400 790,395 Q770,385 765,370 Q760,355 765,340 Q770,332 780,330 Z" />
                              {/* Japan */}
                              <path d="M850,160 Q865,155 875,165 Q880,180 875,195 Q865,205 850,200 Q840,190 840,175 Q845,165 850,160 Z" />
                              {/* UK */}
                              <path d="M485,115 Q495,110 505,120 Q510,130 505,140 Q495,145 485,140 Q480,130 480,120 Q482,115 485,115 Z" />
                              {/* Scandinavia */}
                              <path d="M520,80 Q540,75 560,85 Q575,100 570,120 Q560,135 540,140 Q525,135 515,120 Q515,105 520,90 Q518,82 520,80 Z" />
                              {/* Southeast Asia */}
                              <path d="M730,230 Q760,225 785,235 Q805,250 810,270 Q805,285 785,295 Q760,300 735,295 Q715,285 710,270 Q710,255 720,240 Q725,232 730,230 Z" />
                              {/* Middle East */}
                              <path d="M550,165 Q580,160 605,170 Q625,180 630,200 Q625,215 605,225 Q580,230 560,220 Q545,205 550,185 Q548,170 550,165 Z" />
                              {/* Russia/Siberia */}
                              <path d="M580,70 Q650,65 720,75 Q790,85 850,95 Q890,105 910,125 Q905,140 875,145 Q845,140 815,135 Q785,130 755,125 Q725,120 695,115 Q665,110 635,105 Q605,100 580,95 Q575,85 580,70 Z" />
                            </g>
                            
                            {/* Deal markers overlaid on the map */}
                            {dealsByCountry.slice(0, 10).map((country, index) => {
                              const maxValue = dealsByCountry[0]?.value || 1;
                              const intensity = (country.value / maxValue);
                              const size = Math.max(12, intensity * 25);
                              
                              // Accurate country coordinates for the new world map
                              const countryPositions: Record<string, { x: number, y: number }> = {
                                "united arab emirates": { x: 600, y: 190 },
                                "uae": { x: 600, y: 190 },
                                "kuwait": { x: 590, y: 185 },
                                "oman": { x: 620, y: 200 },
                                "saudi arabia": { x: 580, y: 190 },
                                "qatar": { x: 595, y: 188 },
                                "bahrain": { x: 593, y: 186 },
                                "united states": { x: 220, y: 130 },
                                "usa": { x: 220, y: 130 },
                                "canada": { x: 200, y: 80 },
                                "mexico": { x: 200, y: 210 },
                                "brazil": { x: 280, y: 300 },
                                "uk": { x: 495, y: 125 },
                                "united kingdom": { x: 495, y: 125 },
                                "germany": { x: 520, y: 120 },
                                "france": { x: 500, y: 130 },
                                "china": { x: 740, y: 150 },
                                "india": { x: 670, y: 210 },
                                "japan": { x: 865, y: 175 },
                                "australia": { x: 820, y: 350 }
                              };
                              
                              const position = countryPositions[country.name.toLowerCase()];
                              if (!position) return null;
                              
                              const getColor = () => {
                                if (intensity > 0.8) return "#dc2626";
                                if (intensity > 0.6) return "#ea580c";
                                if (intensity > 0.4) return "#ca8a04";
                                if (intensity > 0.2) return "#16a34a";
                                return "#2563eb";
                              };
                              
                              return (
                                <g key={country.name}>
                                  <circle
                                    cx={position.x}
                                    cy={position.y}
                                    r={size + 3}
                                    fill={getColor()}
                                    opacity="0.3"
                                  />
                                  <circle
                                    cx={position.x}
                                    cy={position.y}
                                    r={size}
                                    fill={getColor()}
                                    opacity="0.9"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="cursor-pointer hover:opacity-100 transition-all hover:scale-110"
                                  />
                                  <text
                                    x={position.x}
                                    y={position.y + 3}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="white"
                                    fontWeight="bold"
                                    className="pointer-events-none select-none"
                                  >
                                    {country.count}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      </div>

                    {/* Deals by Country */}
                    <div className="relative">
                      <h3 className="text-lg font-semibold mb-4">Top Countries by Deal Value</h3>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-[400px] overflow-auto">
                        <div className="space-y-3">
                          {dealsByCountry.slice(0, 10).map((country, index) => {
                            const maxValue = dealsByCountry[0]?.value || 1;
                            const percentage = Math.round((country.value / maxValue) * 100);
                            
                            return (
                              <div key={country.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-4 h-4 rounded-full" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {country.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {country.count} deals
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(country.value)}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {percentage}%
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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