import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Deal, Company, Partner, Contact, Activity, insertActivitySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, DollarSign, Calendar, User, Building2, Users, Phone, Mail, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const activityFormSchema = insertActivitySchema.extend({
  type: z.enum(["call", "email", "meeting", "note"]),
});

type ActivityFormData = z.infer<typeof activityFormSchema>;

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const { toast } = useToast();
  
  const { data: deal, isLoading, error } = useQuery<Deal>({
    queryKey: [`/api/deals/${id}`],
    enabled: !!id,
  });



  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      type: "note",
      description: "",
      dealId: parseInt(id || "0"),
      userId: 6, // Default to existing user
      companyId: deal?.companyId || null,
      contactId: deal?.contactId || null,
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: (data: ActivityFormData) => apiRequest("POST", "/api/activities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setShowActivityForm(false);
      form.reset();
      toast({
        title: "Activity added",
        description: "The activity has been successfully added to this deal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (activityId: number) => apiRequest("DELETE", `/api/activities/${activityId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Activity deleted",
        description: "The activity has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitActivity = (data: ActivityFormData) => {
    createActivityMutation.mutate({
      ...data,
      dealId: parseInt(id || "0"),
      userId: 6, // Use valid user ID
      companyId: deal?.companyId || null,
      contactId: deal?.contactId || null,
    });
  };

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

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities
                    .filter(activity => activity.dealId === parseInt(id || "0"))
                    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
                    .map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.type === "call" && <Phone className="h-5 w-5 text-blue-600" />}
                          {activity.type === "email" && <Mail className="h-5 w-5 text-green-600" />}
                          {activity.type === "meeting" && <Calendar className="h-5 w-5 text-purple-600" />}
                          {activity.type === "note" && <FileText className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {activity.createdAt ? format(new Date(activity.createdAt), "MMM dd, yyyy 'at' HH:mm") : ""}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteActivityMutation.mutate(activity.id)}
                                disabled={deleteActivityMutation.isPending}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">No activities recorded yet. Add your first activity using the button above.</p>
              )}
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowActivityForm(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={showActivityForm} onOpenChange={setShowActivityForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>
              Record a new activity for this deal. This will help track your interactions and progress.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitActivity)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter activity title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter activity details..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowActivityForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createActivityMutation.isPending}
                >
                  {createActivityMutation.isPending ? "Adding..." : "Add Activity"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealDetail;