import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EmailTemplate, EmailCampaign } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Mail, Send, Users, FileText } from "lucide-react";
import { EmailTemplateForm } from "./EmailTemplateForm";
import { EmailCampaignForm } from "./EmailCampaignForm";
import { SendEmailToListForm } from "./SendEmailToListForm";

export default function EmailPage() {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showSendToListDialog, setShowSendToListDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const { toast } = useToast();

  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  const { data: campaigns = [] } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/email-campaigns"],
  });

  const sendCampaignMutation = useMutation({
    mutationFn: (campaignId: number) => 
      apiRequest("POST", `/api/email-campaigns/${campaignId}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      toast({
        title: "Success",
        description: "Email campaign sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to send campaign",
        variant: "destructive",
      });
    },
  });

  const handleSendCampaign = (campaign: EmailCampaign) => {
    if (confirm(`Are you sure you want to send the campaign "${campaign.name}"? This action cannot be undone.`)) {
      sendCampaignMutation.mutate(campaign.id);
    }
  };

  const handleTemplateEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(true);
  };

  const handleCampaignEdit = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDialog(true);
  };

  const handleCloseTemplateDialog = () => {
    setShowTemplateDialog(false);
    setSelectedTemplate(null);
  };

  const handleCloseCampaignDialog = () => {
    setShowCampaignDialog(false);
    setSelectedCampaign(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Email Marketing</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={showSendToListDialog} onOpenChange={setShowSendToListDialog}>
            <DialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Send to List
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Send Email to Contact List</DialogTitle>
              </DialogHeader>
              <SendEmailToListForm onClose={() => setShowSendToListDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Email Campaigns</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage email campaigns for your contacts
              </p>
            </div>
            <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCampaign ? "Edit Campaign" : "Create New Campaign"}
                  </DialogTitle>
                </DialogHeader>
                <EmailCampaignForm
                  campaign={selectedCampaign}
                  onClose={handleCloseCampaignDialog}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'Sent' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </div>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      Subject: {campaign.subject}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      From: {campaign.fromEmail}
                    </div>
                    {campaign.sentAt && (
                      <div className="text-sm text-muted-foreground">
                        Sent: {new Date(campaign.sentAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCampaignEdit(campaign)}
                    >
                      Edit
                    </Button>
                    {campaign.status === 'Draft' && (
                      <Button 
                        size="sm"
                        onClick={() => handleSendCampaign(campaign)}
                        disabled={sendCampaignMutation.isPending}
                      >
                        <Send className="mr-1 h-3 w-3" />
                        {sendCampaignMutation.isPending ? "Sending..." : "Send"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {campaigns.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No email campaigns yet. Create your first campaign to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Email Templates</h3>
              <p className="text-sm text-muted-foreground">
                Create reusable email templates for your campaigns
              </p>
            </div>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTemplate ? "Edit Template" : "Create New Template"}
                  </DialogTitle>
                </DialogHeader>
                <EmailTemplateForm
                  template={selectedTemplate}
                  onClose={handleCloseTemplateDialog}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="mr-2 h-4 w-4" />
                      Subject: {template.subject}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateEdit(template)}
                    >
                      Edit Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No email templates yet. Create your first template to get started.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}