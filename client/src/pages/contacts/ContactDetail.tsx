import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Contact, Activity as ActivityType, Task, Deal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Briefcase, MapPin, Calendar, User, Building2 } from "lucide-react";
import { format } from "date-fns";

const ContactDetail = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: contact, isLoading: contactLoading } = useQuery<Contact>({
    queryKey: [`/api/contacts/${id}`],
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  if (contactLoading) {
    return <div className="p-6">Loading contact details...</div>;
  }

  if (!contact) {
    return <div className="p-6">Contact not found</div>;
  }

  const company = companies?.find(c => c.id === contact.companyId);
  const contactActivities = activities?.filter(a => a.contactId === contact.id) || [];
  const contactTasks = tasks?.filter(t => t.contactId === contact.id) || [];
  const contactDeals = deals?.filter(d => d.contactId === contact.id) || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "New": return "secondary";
      case "Contacted": return "default";
      case "Qualified": return "default";
      case "Converted": return "default";
      case "Lost": return "destructive";
      default: return "outline";
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-red-600";
      case "High": return "text-orange-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation("/contacts")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
        <h1 className="text-2xl font-semibold">
          {contact.firstName} {contact.lastName}
        </h1>
        <Badge variant={getStatusBadgeVariant(contact.leadStatus || "")}>
          {contact.leadStatus || "N/A"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Email:</span>
                  <span>{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.jobTitle && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Job Title:</span>
                    <span>{contact.jobTitle}</span>
                  </div>
                )}
                {company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Company:</span>
                    <span>{company.name}</span>
                  </div>
                )}
                {contact.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Country:</span>
                    <span>{contact.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Lead Type:</span>
                  <span>{contact.leadType || "N/A"}</span>
                </div>
              </div>
              {contact.notes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 text-gray-600">{contact.notes}</p>
                </div>
              )}
              {contact.tags && contact.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contact.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <p>Loading activities...</p>
              ) : contactActivities.length === 0 ? (
                <p className="text-gray-500">No activities recorded</p>
              ) : (
                <div className="space-y-3">
                  {contactActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {activity.type}
                          </Badge>
                          <span className="text-sm font-medium">{activity.title}</span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          {activity.createdAt && format(new Date(activity.createdAt), "PPp")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <p>Loading tasks...</p>
              ) : contactTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No tasks assigned</p>
              ) : (
                <div className="space-y-2">
                  {contactTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-2 border rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${getTaskPriorityColor(task.priority || "Medium")}`}>
                          {task.priority}
                        </span>
                        <Badge variant={task.completed ? "default" : "outline"} className="text-xs">
                          {task.completed ? "Done" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500">
                          Due: {format(new Date(task.dueDate), "PP")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deals */}
          <Card>
            <CardHeader>
              <CardTitle>Related Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {dealsLoading ? (
                <p>Loading deals...</p>
              ) : contactDeals.length === 0 ? (
                <p className="text-gray-500 text-sm">No deals found</p>
              ) : (
                <div className="space-y-2">
                  {contactDeals.slice(0, 3).map((deal) => (
                    <div key={deal.id} className="p-2 border rounded">
                      <p className="text-sm font-medium">{deal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {deal.stage}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {deal.currency} {deal.value?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Activities:</span>
                <span className="font-medium">{contactActivities.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Open Tasks:</span>
                <span className="font-medium">
                  {contactTasks.filter(t => !t.completed).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Deals:</span>
                <span className="font-medium">
                  {contactDeals.filter(d => d.stage !== "Lost" && d.stage !== "Won").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;