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
                        {/* World map with proper country outlines */}
                        <svg viewBox="0 0 1000 500" className="w-full h-full">
                          {/* Background */}
                          <rect width="1000" height="500" fill="currentColor" className="text-blue-50 dark:text-blue-900/20" />
                          
                          {/* World map countries - simplified but accurate shapes */}
                          <g className="text-gray-300 dark:text-gray-600" fill="currentColor" stroke="white" strokeWidth="0.5">
                            {/* United States */}
                            <path d="M160,120 L280,110 L290,140 L270,180 L250,190 L220,185 L180,175 L150,160 Z" />
                            {/* Canada */}
                            <path d="M140,80 L300,70 L320,100 L290,110 L160,120 L130,100 Z" />
                            {/* Mexico */}
                            <path d="M160,190 L220,185 L240,200 L220,220 L180,215 Z" />
                            {/* Brazil */}
                            <path d="M280,250 L320,240 L340,280 L320,320 L290,330 L260,310 L250,280 Z" />
                            {/* United Kingdom */}
                            <path d="M480,120 L490,115 L495,125 L490,135 L485,140 L475,135 L475,125 Z" />
                            {/* France */}
                            <path d="M490,140 L510,135 L515,150 L505,160 L485,155 Z" />
                            {/* Germany */}
                            <path d="M510,125 L525,120 L530,140 L520,150 L505,145 Z" />
                            {/* Spain */}
                            <path d="M470,160 L500,155 L510,170 L485,175 Z" />
                            {/* Italy */}
                            <path d="M520,150 L535,145 L540,170 L530,180 L525,165 Z" />
                            {/* Russia */}
                            <path d="M540,80 L750,70 L780,120 L750,140 L700,145 L650,130 L600,110 L550,100 Z" />
                            {/* China */}
                            <path d="M700,140 L780,135 L790,180 L770,200 L720,190 L680,170 Z" />
                            {/* India */}
                            <path d="M650,180 L700,175 L710,220 L680,240 L660,225 L640,200 Z" />
                            {/* Japan */}
                            <path d="M820,150 L840,145 L845,170 L835,180 L825,175 Z" />
                            {/* Australia */}
                            <path d="M750,280 L820,275 L830,300 L810,315 L780,310 L760,295 Z" />
                            {/* South Africa */}
                            <path d="M520,280 L560,275 L570,300 L550,315 L530,310 Z" />
                            {/* Egypt */}
                            <path d="M520,200 L540,195 L545,215 L535,225 L525,220 Z" />
                            {/* Saudi Arabia */}
                            <path d="M560,200 L590,195 L600,220 L580,230 L565,225 Z" />
                            {/* United Arab Emirates */}
                            <path d="M600,220 L620,218 L625,230 L615,235 L605,232 Z" />
                            {/* Turkey */}
                            <path d="M540,160 L580,155 L590,170 L570,180 L550,175 Z" />
                            {/* Iran */}
                            <path d="M590,170 L620,165 L630,190 L615,200 L600,195 Z" />
                            {/* Afghanistan */}
                            <path d="M620,165 L645,160 L650,180 L635,190 L625,185 Z" />
                            {/* Pakistan */}
                            <path d="M630,180 L650,175 L660,200 L645,210 L635,205 Z" />
                            {/* Indonesia */}
                            <path d="M700,240 L760,235 L770,250 L750,260 L720,255 Z" />
                            {/* Nigeria */}
                            <path d="M480,220 L510,215 L520,235 L500,245 L485,240 Z" />
                            {/* Kenya */}
                            <path d="M560,240 L580,235 L585,255 L575,265 L565,260 Z" />
                            {/* Morocco */}
                            <path d="M460,180 L485,175 L490,195 L475,205 L465,200 Z" />
                            {/* Algeria */}
                            <path d="M485,175 L520,170 L530,195 L510,205 L490,200 Z" />
                            {/* Libya */}
                            <path d="M510,195 L540,190 L545,210 L525,220 L515,215 Z" />
                            {/* Sudan */}
                            <path d="M540,215 L570,210 L575,235 L555,245 L545,240 Z" />
                            {/* Ethiopia */}
                            <path d="M570,235 L590,230 L595,250 L585,260 L575,255 Z" />
                            {/* Madagascar */}
                            <path d="M590,270 L605,265 L610,285 L600,295 L595,290 Z" />
                            {/* Philippines */}
                            <path d="M770,200 L790,195 L795,215 L785,225 L775,220 Z" />
                            {/* Thailand */}
                            <path d="M720,200 L740,195 L745,220 L735,230 L725,225 Z" />
                            {/* Vietnam */}
                            <path d="M740,180 L760,175 L765,205 L750,215 L745,210 Z" />
                            {/* South Korea */}
                            <path d="M800,160 L815,155 L820,170 L810,180 L805,175 Z" />
                            {/* North Korea */}
                            <path d="M795,145 L810,140 L815,155 L805,165 L800,160 Z" />
                            {/* Mongolia */}
                            <path d="M720,120 L770,115 L780,135 L750,145 L730,140 Z" />
                            {/* Kazakhstan */}
                            <path d="M600,110 L680,105 L690,130 L670,140 L620,135 Z" />
                            {/* Ukraine */}
                            <path d="M540,120 L580,115 L590,135 L570,145 L550,140 Z" />
                            {/* Poland */}
                            <path d="M520,115 L540,110 L545,130 L535,140 L525,135 Z" />
                            {/* Romania */}
                            <path d="M540,135 L560,130 L565,150 L555,160 L545,155 Z" />
                            {/* Greece */}
                            <path d="M530,170 L545,165 L550,180 L540,190 L535,185 Z" />
                            {/* Bulgaria */}
                            <path d="M535,155 L550,150 L555,165 L545,175 L540,170 Z" />
                            {/* Serbia */}
                            <path d="M525,150 L540,145 L545,160 L535,170 L530,165 Z" />
                            {/* Hungary */}
                            <path d="M520,140 L535,135 L540,150 L530,160 L525,155 Z" />
                            {/* Czech Republic */}
                            <path d="M515,130 L530,125 L535,140 L525,150 L520,145 Z" />
                            {/* Austria */}
                            <path d="M510,140 L525,135 L530,150 L520,160 L515,155 Z" />
                            {/* Switzerland */}
                            <path d="M505,145 L520,140 L525,155 L515,165 L510,160 Z" />
                            {/* Belgium */}
                            <path d="M495,130 L510,125 L515,140 L505,150 L500,145 Z" />
                            {/* Netherlands */}
                            <path d="M500,120 L515,115 L520,130 L510,140 L505,135 Z" />
                            {/* Denmark */}
                            <path d="M515,110 L530,105 L535,120 L525,130 L520,125 Z" />
                            {/* Sweden */}
                            <path d="M525,90 L540,85 L545,110 L535,120 L530,115 Z" />
                            {/* Norway */}
                            <path d="M515,85 L535,80 L540,105 L530,115 L525,110 Z" />
                            {/* Finland */}
                            <path d="M540,85 L560,80 L565,105 L555,115 L545,110 Z" />
                            {/* Baltic States */}
                            <path d="M535,105 L555,100 L560,115 L550,125 L540,120 Z" />
                            {/* Belarus */}
                            <path d="M545,115 L565,110 L570,130 L560,140 L550,135 Z" />
                            {/* Argentina */}
                            <path d="M260,310 L290,305 L300,360 L280,380 L260,375 Z" />
                            {/* Chile */}
                            <path d="M250,320 L270,315 L275,375 L265,385 L255,380 Z" />
                            {/* Peru */}
                            <path d="M240,280 L270,275 L280,305 L260,315 L250,310 Z" />
                            {/* Colombia */}
                            <path d="M220,240 L250,235 L260,260 L240,270 L230,265 Z" />
                            {/* Venezuela */}
                            <path d="M240,230 L270,225 L280,245 L260,255 L250,250 Z" />
                            {/* Ecuador */}
                            <path d="M210,260 L240,255 L250,275 L230,285 L220,280 Z" />
                            {/* Bolivia */}
                            <path d="M250,295 L280,290 L290,315 L270,325 L260,320 Z" />
                            {/* Paraguay */}
                            <path d="M280,315 L300,310 L310,330 L295,340 L285,335 Z" />
                            {/* Uruguay */}
                            <path d="M290,340 L310,335 L320,350 L305,360 L295,355 Z" />
                            {/* Guyana */}
                            <path d="M270,225 L290,220 L295,235 L285,245 L275,240 Z" />
                            {/* Suriname */}
                            <path d="M285,220 L305,215 L310,230 L300,240 L290,235 Z" />
                            {/* French Guiana */}
                            <path d="M300,215 L320,210 L325,225 L315,235 L305,230 Z" />
                          </g>
                          
                          {/* Country indicators */}
                          {dealsByCountry.slice(0, 10).map((country, index) => {
                            const maxValue = dealsByCountry[0]?.value || 1;
                            const intensity = (country.value / maxValue);
                            const size = Math.max(8, intensity * 20);
                            
                            // Country coordinates mapped to world map positions
                            const positions = [
                              { x: 220, y: 140, name: "United States" },
                              { x: 220, y: 140, name: "USA" },
                              { x: 520, y: 130, name: "Germany" },
                              { x: 675, y: 210, name: "India" },
                              { x: 740, y: 160, name: "China" },
                              { x: 485, y: 125, name: "United Kingdom" },
                              { x: 485, y: 125, name: "UK" },
                              { x: 500, y: 147, name: "France" },
                              { x: 830, y: 160, name: "Japan" },
                              { x: 300, y: 285, name: "Brazil" },
                              { x: 785, y: 298, name: "Australia" },
                              { x: 745, y: 215, name: "Singapore" },
                              { x: 612, y: 227, name: "United Arab Emirates" },
                              { x: 612, y: 227, name: "UAE" },
                              { x: 580, y: 215, name: "Saudi Arabia" },
                              { x: 530, y: 208, name: "Egypt" },
                              { x: 565, y: 165, name: "Turkey" },
                              { x: 605, y: 180, name: "Iran" },
                              { x: 640, y: 190, name: "Pakistan" },
                              { x: 730, y: 225, name: "Indonesia" },
                              { x: 500, y: 230, name: "Nigeria" },
                              { x: 575, y: 250, name: "Kenya" },
                              { x: 475, y: 190, name: "Morocco" },
                              { x: 505, y: 185, name: "Algeria" },
                              { x: 525, y: 203, name: "Libya" },
                              { x: 555, y: 227, name: "Sudan" },
                              { x: 782, y: 208, name: "Philippines" },
                              { x: 732, y: 208, name: "Thailand" },
                              { x: 752, y: 190, name: "Vietnam" },
                              { x: 807, y: 167, name: "South Korea" },
                              { x: 730, y: 127, name: "Mongolia" },
                              { x: 640, y: 122, name: "Kazakhstan" },
                              { x: 565, y: 127, name: "Ukraine" },
                              { x: 530, y: 122, name: "Poland" },
                              { x: 550, y: 142, name: "Romania" },
                              { x: 540, y: 177, name: "Greece" },
                              { x: 517, y: 147, name: "Switzerland" },
                              { x: 507, y: 127, name: "Netherlands" },
                              { x: 522, y: 112, name: "Denmark" },
                              { x: 532, y: 97, name: "Sweden" },
                              { x: 525, y: 92, name: "Norway" },
                              { x: 552, y: 92, name: "Finland" },
                              { x: 275, y: 347, name: "Argentina" },
                              { x: 262, y: 350, name: "Chile" },
                              { x: 255, y: 297, name: "Peru" },
                              { x: 235, y: 252, name: "Colombia" },
                              { x: 255, y: 242, name: "Venezuela" },
                              { x: 225, y: 272, name: "Ecuador" }
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