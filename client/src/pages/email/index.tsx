import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Mail,
  Inbox,
  Send,
  Archive,
  Trash2,
  Star,
  Plus,
  Search,
  Tag,
  RefreshCw,
  MoreVertical,
  Reply,
  Forward,
  Trash,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Tag as TagIcon
} from "lucide-react";
import { Contact } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Email interface
interface Email {
  id: number;
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  subject: string;
  body: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
  date: Date;
  read: boolean;
  starred: boolean;
  folder: "inbox" | "sent" | "drafts" | "archive" | "trash";
  labels?: string[];
  threadId?: number;
}

// Email templates interface
interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  category: string;
}

const EmailPage = () => {
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState<string>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch contacts for recipient suggestions
  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Sample email data (in a real app, this would come from an API)
  const [emails, setEmails] = useState<Email[]>([
    {
      id: 1,
      from: {
        name: "Sarah Chen",
        email: "sarah.chen@goumbook.com",
        avatarUrl: ""
      },
      to: [{ name: "John Doe", email: "john.doe@potential.crm" }],
      subject: "Sustainability Campaign Proposal",
      body: `<p>Hi John,</p>
      <p>I wanted to follow up on our conversation about the sustainability campaign. We're excited to partner with you on this initiative.</p>
      <p>I've attached our proposal that outlines the campaign strategy, timeline, and budget. Please review it and let me know your thoughts.</p>
      <p>We're particularly interested in the social media component and would love your input on how we can maximize engagement.</p>
      <p>Best regards,<br>Sarah Chen<br>Marketing Director<br>Goumbook</p>`,
      date: new Date(2025, 4, 24, 14, 32),
      read: true,
      starred: true,
      folder: "inbox",
      labels: ["important", "client"]
    },
    {
      id: 2,
      from: {
        name: "Michael Wong",
        email: "michael.wong@hsbc.com",
        avatarUrl: ""
      },
      to: [{ name: "John Doe", email: "john.doe@potential.crm" }],
      subject: "Meeting Request: Financial Services Marketing Strategy",
      body: `<p>Dear John,</p>
      <p>I hope this email finds you well. I'm reaching out to schedule a meeting to discuss our marketing strategy for Q3 2025.</p>
      <p>We're looking to refresh our approach and would value your expertise in creating more targeted campaigns for our premium banking services.</p>
      <p>Would you be available next Tuesday at 2 PM for a virtual meeting?</p>
      <p>Regards,<br>Michael Wong<br>VP Marketing<br>HSBC</p>`,
      date: new Date(2025, 4, 23, 10, 15),
      read: true,
      starred: false,
      folder: "inbox"
    },
    {
      id: 3,
      from: {
        name: "Aisha Al Mahmoud",
        email: "aisha@vxacademy.edu",
        avatarUrl: ""
      },
      to: [{ name: "John Doe", email: "john.doe@potential.crm" }],
      subject: "Training Program Invoice",
      body: `<p>Hello John,</p>
      <p>Please find attached the invoice for the leadership training program we recently completed for your team.</p>
      <p>The feedback from participants has been excellent, and we've compiled a summary report that I'll send in a separate email.</p>
      <p>Don't hesitate to reach out if you have any questions about the invoice or if you'd like to discuss future training opportunities.</p>
      <p>Thank you for your business!</p>
      <p>Best,<br>Aisha Al Mahmoud<br>Program Director<br>VX Academy</p>`,
      attachments: [
        { name: "Invoice-VXA-2025-0542.pdf", size: "245 KB", type: "application/pdf" }
      ],
      date: new Date(2025, 4, 22, 16, 45),
      read: false,
      starred: false,
      folder: "inbox",
      labels: ["finance"]
    },
    {
      id: 4,
      from: {
        name: "John Doe",
        email: "john.doe@potential.crm",
        avatarUrl: ""
      },
      to: [{ name: "Sarah Chen", email: "sarah.chen@goumbook.com" }],
      subject: "Re: Sustainability Campaign Proposal",
      body: `<p>Hi Sarah,</p>
      <p>Thanks for sending over the proposal. I've had a chance to review it and I'm impressed with the comprehensive approach you've outlined.</p>
      <p>I particularly like the idea of the interactive social media challenge. I think we could amplify this by partnering with some of our influencer contacts.</p>
      <p>Let's schedule a call next week to discuss the next steps. Would Wednesday at 11 AM work for you?</p>
      <p>Best regards,<br>John</p>`,
      date: new Date(2025, 4, 24, 16, 10),
      read: true,
      starred: false,
      folder: "sent",
      threadId: 1
    },
    {
      id: 5,
      from: {
        name: "John Doe",
        email: "john.doe@potential.crm",
        avatarUrl: ""
      },
      to: [
        { name: "Team", email: "team@potential.crm" }
      ],
      subject: "Weekly Marketing Update - May 25, 2025",
      body: `<p>Hi team,</p>
      <p>Here's our weekly marketing update:</p>
      <ul>
        <li>We've launched the HSBC campaign with great initial results - open rates are at 32%</li>
        <li>The Goumbook sustainability project is in final planning stages</li>
        <li>We need to schedule the content calendar for VX Academy's new course launch</li>
      </ul>
      <p>Let's discuss these items in more detail during our Monday meeting.</p>
      <p>Have a great weekend!</p>
      <p>John</p>`,
      date: new Date(2025, 4, 25, 9, 0),
      read: true,
      starred: false,
      folder: "sent"
    }
  ]);

  // Sample email templates (in a real app, this would come from an API)
  const emailTemplates: EmailTemplate[] = [
    {
      id: 1,
      name: "Welcome New Client",
      subject: "Welcome to Potential CRM - Next Steps",
      body: `<p>Dear [Client Name],</p>
      <p>Welcome to Potential CRM! We're thrilled to have you on board.</p>
      <p>Your account has been set up and is ready to use. Here are a few next steps to get you started:</p>
      <ol>
        <li>Complete your profile setup</li>
        <li>Import your contacts</li>
        <li>Schedule an onboarding call with your account manager</li>
      </ol>
      <p>If you have any questions, please don't hesitate to reach out.</p>
      <p>Best regards,<br>[Your Name]<br>Account Manager</p>`,
      category: "Onboarding"
    },
    {
      id: 2,
      name: "Meeting Follow-up",
      subject: "Follow-up: [Meeting Topic] Discussion",
      body: `<p>Hi [Name],</p>
      <p>Thank you for taking the time to meet with me today to discuss [topic].</p>
      <p>As discussed, here are the key points and next steps:</p>
      <ul>
        <li>[Key point 1]</li>
        <li>[Key point 2]</li>
        <li>[Key point 3]</li>
      </ul>
      <p>I'll follow up with [specific action item] by [date].</p>
      <p>Please let me know if you have any questions in the meantime.</p>
      <p>Best regards,<br>[Your Name]</p>`,
      category: "Follow-up"
    },
    {
      id: 3,
      name: "Proposal Submission",
      subject: "Proposal: [Project Name] for [Company]",
      body: `<p>Dear [Name],</p>
      <p>I'm pleased to submit our proposal for [project name].</p>
      <p>This proposal includes:</p>
      <ul>
        <li>Project scope and objectives</li>
        <li>Timeline and milestones</li>
        <li>Budget breakdown</li>
        <li>Team structure and responsibilities</li>
      </ul>
      <p>We're excited about the opportunity to work with you on this project and believe our approach will deliver exceptional results.</p>
      <p>I'm available to discuss any aspects of the proposal in more detail. Would you have time for a call next week?</p>
      <p>Best regards,<br>[Your Name]</p>`,
      category: "Sales"
    }
  ];

  // Filter emails based on active folder and search query
  const filteredEmails = emails.filter(email => {
    const matchesFolder = email.folder === activeFolder;
    
    if (!searchQuery) return matchesFolder;
    
    const query = searchQuery.toLowerCase();
    return (
      matchesFolder &&
      (email.subject.toLowerCase().includes(query) ||
       email.from.name.toLowerCase().includes(query) ||
       email.from.email.toLowerCase().includes(query) ||
       email.body.toLowerCase().includes(query))
    );
  });

  // Mark email as read
  const markAsRead = (emailId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    ));
  };

  // Toggle star status
  const toggleStar = (emailId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  };

  // Move email to folder
  const moveToFolder = (emailId: number, folder: "inbox" | "sent" | "drafts" | "archive" | "trash") => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, folder } : email
    ));
    
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
    
    toast({
      title: "Email moved",
      description: `Email moved to ${folder}`
    });
  };

  // Handle send email
  const handleSendEmail = () => {
    if (!newEmail.to || !newEmail.subject) {
      toast({
        title: "Missing information",
        description: "Please provide at least a recipient and subject",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would send the email via an API
    const sentEmail: Email = {
      id: emails.length + 1,
      from: {
        name: "John Doe",
        email: "john.doe@potential.crm"
      },
      to: newEmail.to.split(',').map(email => ({
        name: email.trim(),
        email: email.trim()
      })),
      subject: newEmail.subject,
      body: newEmail.body,
      date: new Date(),
      read: true,
      starred: false,
      folder: "sent"
    };

    setEmails([sentEmail, ...emails]);
    setIsComposeOpen(false);
    setNewEmail({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: ""
    });

    toast({
      title: "Email sent",
      description: "Your email has been sent successfully"
    });
  };

  // Apply email template
  const applyTemplate = (template: EmailTemplate) => {
    setNewEmail({
      ...newEmail,
      subject: template.subject,
      body: template.body
    });
    setIsTemplatesOpen(false);
  };

  // Render sidebar
  const renderSidebar = () => {
    const folderCounts = {
      inbox: emails.filter(e => e.folder === "inbox").length,
      sent: emails.filter(e => e.folder === "sent").length,
      drafts: emails.filter(e => e.folder === "drafts").length,
      archive: emails.filter(e => e.folder === "archive").length,
      trash: emails.filter(e => e.folder === "trash").length
    };

    const unreadCount = emails.filter(e => e.folder === "inbox" && !e.read).length;

    return (
      <div className="w-64 border-r h-full">
        <div className="p-4">
          <Button 
            className="w-full justify-start" 
            onClick={() => setIsComposeOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Compose
          </Button>

          <div className="mt-6 space-y-1">
            <Button
              variant={activeFolder === "inbox" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveFolder("inbox")}
            >
              <Inbox className="mr-2 h-4 w-4" />
              Inbox
              {unreadCount > 0 && (
                <Badge className="ml-auto">{unreadCount}</Badge>
              )}
            </Button>
            
            <Button
              variant={activeFolder === "sent" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveFolder("sent")}
            >
              <Send className="mr-2 h-4 w-4" />
              Sent
              {folderCounts.sent > 0 && (
                <span className="ml-auto text-xs text-gray-500">{folderCounts.sent}</span>
              )}
            </Button>
            
            <Button
              variant={activeFolder === "drafts" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveFolder("drafts")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Drafts
              {folderCounts.drafts > 0 && (
                <span className="ml-auto text-xs text-gray-500">{folderCounts.drafts}</span>
              )}
            </Button>
            
            <Button
              variant={activeFolder === "archive" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveFolder("archive")}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
              {folderCounts.archive > 0 && (
                <span className="ml-auto text-xs text-gray-500">{folderCounts.archive}</span>
              )}
            </Button>
            
            <Button
              variant={activeFolder === "trash" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveFolder("trash")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Trash
              {folderCounts.trash > 0 && (
                <span className="ml-auto text-xs text-gray-500">{folderCounts.trash}</span>
              )}
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">Labels</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Badge variant="outline" className="mr-2 bg-red-100 hover:bg-red-100 text-red-800 border-red-200">
                <span className="flex h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                Important
              </Badge>
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Badge variant="outline" className="mr-2 bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                Client
              </Badge>
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Badge variant="outline" className="mr-2 bg-green-100 hover:bg-green-100 text-green-800 border-green-200">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                Finance
              </Badge>
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Badge variant="outline" className="mr-2 bg-purple-100 hover:bg-purple-100 text-purple-800 border-purple-200">
                <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-1"></span>
                Personal
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render email list
  const renderEmailList = () => {
    return (
      <div className="w-80 border-r h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Mail className="h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium">No emails found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : `Your ${activeFolder} is empty`}
              </p>
            </div>
          ) : (
            <div>
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`
                    p-4 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
                    ${email.read ? '' : 'bg-blue-50 dark:bg-blue-900/20'}
                    ${selectedEmail?.id === email.id ? 'bg-gray-100 dark:bg-gray-800' : ''}
                  `}
                  onClick={() => {
                    setSelectedEmail(email);
                    if (!email.read) markAsRead(email.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {email.from.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <p className={`text-sm font-medium ${!email.read ? 'font-semibold' : ''}`}>
                            {activeFolder === 'sent' 
                              ? `To: ${email.to.map(t => t.name).join(', ')}` 
                              : email.from.name}
                          </p>
                        </div>
                        <p className={`text-sm ${!email.read ? 'font-semibold' : ''}`}>
                          {email.subject}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500 truncate">
                            {format(new Date(email.date), 'MMM d, h:mm a')}
                          </p>
                          {email.attachments && email.attachments.length > 0 && (
                            <span className="text-xs text-gray-500">
                              📎
                            </span>
                          )}
                          {email.labels && email.labels.length > 0 && (
                            <div className="flex space-x-1">
                              {email.labels.map((label) => (
                                <span
                                  key={label}
                                  className={`
                                    w-2 h-2 rounded-full
                                    ${label === 'important' ? 'bg-red-500' : ''}
                                    ${label === 'client' ? 'bg-blue-500' : ''}
                                    ${label === 'finance' ? 'bg-green-500' : ''}
                                    ${label === 'personal' ? 'bg-purple-500' : ''}
                                  `}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-yellow-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(email.id);
                      }}
                    >
                      <Star className={`h-4 w-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render email view
  const renderEmailView = () => {
    if (!selectedEmail) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">Select an email to view</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Choose an email from the list to view its contents here
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              title="Reply"
              onClick={() => {
                setNewEmail({
                  to: selectedEmail.from.email,
                  cc: "",
                  bcc: "",
                  subject: `Re: ${selectedEmail.subject}`,
                  body: `<p>On ${format(new Date(selectedEmail.date), 'MMM d, yyyy')}, ${selectedEmail.from.name} wrote:</p><blockquote>${selectedEmail.body}</blockquote><p></p>`
                });
                setIsComposeOpen(true);
              }}
            >
              <Reply className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              title="Forward"
              onClick={() => {
                setNewEmail({
                  to: "",
                  cc: "",
                  bcc: "",
                  subject: `Fwd: ${selectedEmail.subject}`,
                  body: `<p>---------- Forwarded message ---------</p>
                  <p>From: ${selectedEmail.from.name} &lt;${selectedEmail.from.email}&gt;</p>
                  <p>Date: ${format(new Date(selectedEmail.date), 'MMM d, yyyy')}</p>
                  <p>Subject: ${selectedEmail.subject}</p>
                  <p>To: ${selectedEmail.to.map(t => t.name).join(', ')}</p>
                  <br />
                  ${selectedEmail.body}`
                });
                setIsComposeOpen(true);
              }}
            >
              <Forward className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => moveToFolder(selectedEmail.id, "archive")}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => moveToFolder(selectedEmail.id, "trash")}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TagIcon className="h-4 w-4 mr-2" />
                  Add Label
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {selectedEmail.from.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-base font-semibold">{selectedEmail.from.name}</h3>
                  <span className="text-sm text-gray-500">&lt;{selectedEmail.from.email}&gt;</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  <span>To: {selectedEmail.to.map(t => t.name).join(', ')}</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  <span>{format(new Date(selectedEmail.date), 'MMM d, yyyy, h:mm a')}</span>
                </div>
              </div>
            </div>
            
            {selectedEmail.starred ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-yellow-400"
                onClick={() => toggleStar(selectedEmail.id)}
              >
                <Star className="h-4 w-4 fill-yellow-400" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => toggleStar(selectedEmail.id)}
              >
                <Star className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div 
            className="prose dark:prose-invert max-w-none mt-4"
            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
          />
          
          {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Attachments ({selectedEmail.attachments.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedEmail.attachments.map((attachment, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded mr-3">
                      <span className="text-lg">
                        {attachment.type.includes('pdf') ? '📄' : 
                         attachment.type.includes('image') ? '🖼️' : 
                         attachment.type.includes('excel') || attachment.type.includes('sheet') ? '📊' : 
                         attachment.type.includes('word') || attachment.type.includes('document') ? '📝' : 
                         attachment.type.includes('presentation') ? '🎞️' : '📎'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{attachment.size}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email</h1>
        
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="all" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Card className="flex-1 flex">
        <CardContent className="p-0 flex-1 flex h-full">
          {renderSidebar()}
          {renderEmailList()}
          {renderEmailView()}
        </CardContent>
      </Card>
      
      {/* Compose Email Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>New Email</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to" className="text-right">
                To:
              </Label>
              <Input
                id="to"
                value={newEmail.to}
                onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                className="col-span-3"
                placeholder="recipient@example.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cc" className="text-right">
                CC:
              </Label>
              <Input
                id="cc"
                value={newEmail.cc}
                onChange={(e) => setNewEmail({ ...newEmail, cc: e.target.value })}
                className="col-span-3"
                placeholder="cc@example.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bcc" className="text-right">
                BCC:
              </Label>
              <Input
                id="bcc"
                value={newEmail.bcc}
                onChange={(e) => setNewEmail({ ...newEmail, bcc: e.target.value })}
                className="col-span-3"
                placeholder="bcc@example.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject:
              </Label>
              <Input
                id="subject"
                value={newEmail.subject}
                onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                className="col-span-3"
                placeholder="Email subject"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="text-right pt-2">
                <Label htmlFor="body">Body:</Label>
              </div>
              <div className="col-span-3">
                <Textarea
                  id="body"
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                  className="min-h-[200px]"
                  placeholder="Write your email here..."
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsTemplatesOpen(true)}
              >
                Templates
              </Button>
              <Button variant="outline">
                <span className="mr-2">📎</span> Attach
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSendEmail}>
                Send
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Email Templates Dialog */}
      <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Email Templates</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Tabs defaultValue="onboarding">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
              </TabsList>
              
              <TabsContent value="onboarding" className="mt-4">
                <div className="space-y-4">
                  {emailTemplates
                    .filter(template => template.category === "Onboarding")
                    .map(template => (
                      <Card key={template.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm font-medium mb-1">Subject: {template.subject}</p>
                          <div className="text-xs text-gray-500 max-h-20 overflow-hidden">
                            {template.body.substring(0, 150)}...
                          </div>
                        </CardContent>
                        <div className="px-6 pb-4">
                          <Button 
                            size="sm" 
                            onClick={() => applyTemplate(template)}
                          >
                            Use Template
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="follow-up" className="mt-4">
                <div className="space-y-4">
                  {emailTemplates
                    .filter(template => template.category === "Follow-up")
                    .map(template => (
                      <Card key={template.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm font-medium mb-1">Subject: {template.subject}</p>
                          <div className="text-xs text-gray-500 max-h-20 overflow-hidden">
                            {template.body.substring(0, 150)}...
                          </div>
                        </CardContent>
                        <div className="px-6 pb-4">
                          <Button 
                            size="sm" 
                            onClick={() => applyTemplate(template)}
                          >
                            Use Template
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="sales" className="mt-4">
                <div className="space-y-4">
                  {emailTemplates
                    .filter(template => template.category === "Sales")
                    .map(template => (
                      <Card key={template.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm font-medium mb-1">Subject: {template.subject}</p>
                          <div className="text-xs text-gray-500 max-h-20 overflow-hidden">
                            {template.body.substring(0, 150)}...
                          </div>
                        </CardContent>
                        <div className="px-6 pb-4">
                          <Button 
                            size="sm" 
                            onClick={() => applyTemplate(template)}
                          >
                            Use Template
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailPage;