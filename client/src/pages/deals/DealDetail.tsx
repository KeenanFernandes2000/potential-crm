import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Deal, Company, Partner, Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, DollarSign, Calendar, User, Building2, Users } from "lucide-react";
import { format } from "date-fns";

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const { data: deal, isLoading, error } = useQuery<Deal>({
    queryKey: [`/api/deals/${id}`],
    enabled: !!id,
  });

  console.log("Deal Detail Debug:", { id, deal, isLoading, error });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Deal Not Found</h1>
          <p className="text-gray-600 mb-6">The deal you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/deals")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>
        </div>
      </div>
    );
  }

  const company = companies?.find(c => c.id === deal.companyId);
  const partner = partners?.find(p => p.id === deal.partnerId);
  const contact = contacts?.find(c => c.id === deal.contactId);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Inquiry": return "bg-blue-100 text-blue-800";
      case "Qualified": return "bg-yellow-100 text-yellow-800";
      case "Proposal": return "bg-purple-100 text-purple-800";
      case "Negotiation": return "bg-orange-100 text-orange-800";
      case "Won": return "bg-green-100 text-green-800";
      case "Lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/deals")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{deal.title}</h1>
            <p className="text-gray-600">Deal #{deal.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStageColor(deal.stage || "")}>
            {deal.stage}
          </Badge>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Deal
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Deal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Deal Value</label>
                  <p className="text-lg font-semibold">
                    {deal.currency} {deal.value?.toLocaleString() || "0"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stage</label>
                  <p className="text-lg font-semibold">{deal.stage}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-lg">
                    {deal.startDate ? format(new Date(deal.startDate), "MMM dd, yyyy") : "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expected Close Date</label>
                  <p className="text-lg">
                    {deal.expiryDate ? format(new Date(deal.expiryDate), "MMM dd, yyyy") : "Not set"}
                  </p>
                </div>
              </div>
              
              {deal.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900 mt-1">{deal.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Activity timeline coming soon...</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Information */}
          {company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{company.name}</p>
                  {company.industry && (
                    <p className="text-sm text-gray-600">{company.industry}</p>
                  )}
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {contact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{contact.firstName} {contact.lastName}</p>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  {contact.phone && (
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                  )}
                  {contact.jobTitle && (
                    <p className="text-sm text-gray-600">{contact.jobTitle}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Partner Information */}
          {partner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Partner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{partner.name}</p>
                  <p className="text-sm text-gray-600">{partner.email}</p>
                  {partner.phone && (
                    <p className="text-sm text-gray-600">{partner.phone}</p>
                  )}
                  {partner.partnerType && (
                    <Badge variant="secondary">{partner.partnerType}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Create Quotation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealDetail;