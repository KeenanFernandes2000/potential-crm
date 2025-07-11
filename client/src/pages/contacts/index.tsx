import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, FileUp, FileDown, Activity } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import ContactForm from "./ContactForm";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Contacts = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const response = await apiRequest("POST", "/api/activities", activityData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsLogActivityOpen(false);
      toast({
        title: "Activity logged",
        description: "The activity has been logged successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsCreateTaskOpen(false);
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk import mutation
  const bulkImportContacts = useMutation({
    mutationFn: async (contactsData: any[]) => {
      const response = await apiRequest("POST", "/api/contacts/bulk-import", { contacts: contactsData });
      return await response.json();
    },
    onSuccess: (data) => {
      const count = data.createdContacts?.length || 0;
      toast({
        title: "Import successful",
        description: `Successfully imported ${count} contacts`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsBulkImportOpen(false);
      setCsvData([]);
      setColumnMapping({});
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import contacts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    setIsBulkImportOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      setCsvData(rows.filter(row => row.some(cell => cell.length > 0)));
      
      // Auto-map common column names
      if (rows.length > 0) {
        const headers = rows[0];
        const autoMapping: Record<string, string> = {};
        
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
            autoMapping[header] = 'firstName';
          } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
            autoMapping[header] = 'lastName';
          } else if (lowerHeader.includes('email')) {
            autoMapping[header] = 'email';
          } else if (lowerHeader.includes('phone')) {
            autoMapping[header] = 'phone';
          } else if (lowerHeader.includes('job') || lowerHeader.includes('title')) {
            autoMapping[header] = 'jobTitle';
          }
        });
        
        setColumnMapping(autoMapping);
      }
    };
    reader.readAsText(file);
  };

  const performImport = async () => {
    if (csvData.length === 0) return;

    const contactsToImport = csvData.slice(1).map(row => {
      const contact: any = {};
      csvData[0].forEach((header, index) => {
        const mappedField = columnMapping[header];
        if (mappedField && row[index]) {
          contact[mappedField] = row[index];
        }
      });
      return contact;
    }).filter(contact => contact.email); // Only import contacts with email

    bulkImportContacts.mutate(contactsToImport);
  };

  const handleExport = () => {
    if (!contacts || contacts.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no contacts to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["First Name", "Last Name", "Email", "Phone", "Job Title", "Company"];
    const csvContent = [
      headers.join(","),
      ...contacts.map(contact => [
        contact.firstName || "",
        contact.lastName || "",
        contact.email || "",
        contact.phone || "",
        contact.jobTitle || "",
        contact.companyId || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `contacts-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${contacts.length} contacts to CSV file`,
    });
  };



  const handleImportContacts = () => {
    if (!csvData.length || !Object.values(columnMapping).includes('email')) {
      toast({
        title: "Invalid mapping",
        description: "Please map at least the Email column before importing.",
        variant: "destructive",
      });
      return;
    }

    const [headers, ...rows] = csvData;
    const contactsToImport = rows.map(row => {
      const contact: any = {};
      headers.forEach((header, index) => {
        const mappedField = columnMapping[`column_${index}`];
        if (mappedField && row[index]) {
          contact[mappedField] = row[index];
        }
      });
      return contact;
    }).filter(contact => contact.email); // Only import contacts with email

    bulkImportContacts.mutate(contactsToImport);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (contact: Contact) => {
    setLocation(`/contacts/${contact.id}`);
  };

  const handleLogActivity = (contact: Contact) => {
    setSelectedContact(contact);
    setIsLogActivityOpen(true);
  };

  const handleCreateTask = (contact: Contact) => {
    setSelectedContact(contact);
    setIsCreateTaskOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingContact(null);
  };

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            First Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => {
        const contact = row.original;
        const company = companies?.find(c => c.id === contact.companyId);
        return <span>{company?.name || "N/A"}</span>;
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "jobTitle",
      header: "Job Title",
    },
    {
      accessorKey: "leadType",
      header: "Lead Type",
      cell: ({ row }) => {
        return <span>{row.getValue("leadType") || "N/A"}</span>;
      },
    },
    {
      accessorKey: "leadStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("leadStatus") as string;
        let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "default";
        
        switch (status) {
          case "New":
            badgeVariant = "secondary";
            break;
          case "Contacted":
            badgeVariant = "default";
            break;
          case "Qualified":
            badgeVariant = "default";
            break;
          case "Converted":
            badgeVariant = "default";
            break;
          case "Lost":
            badgeVariant = "destructive";
            break;
          default:
            badgeVariant = "outline";
        }
        
        return <Badge variant={badgeVariant}>{status || "N/A"}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contact = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(contact)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewDetails(contact)}>View details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Add to list</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateTask(contact)}>Create task</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLogActivity(contact)}>Log activity</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleImport}>
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Activity className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={contacts || []} 
          searchColumn="firstName"
          searchPlaceholder="Search contacts..."
        />
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <ContactForm 
            contact={editingContact} 
            onClose={closeModal} 
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Import Contacts from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple contacts at once. The first row should contain column headers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="mb-4"
              />
              <p className="text-sm text-muted-foreground">
                Supported format: CSV files with headers (First Name, Last Name, Email, Phone, Job Title)
              </p>
            </div>

            {/* Preview and Column Mapping */}
            {csvData.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Preview & Column Mapping</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted p-2 border-b">
                    <div className="grid grid-cols-5 gap-2 text-sm font-medium">
                      <div>CSV Column</div>
                      <div>Maps to</div>
                      <div>Sample Data</div>
                      <div>Required</div>
                      <div>Action</div>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {csvData[0]?.map((header, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 p-2 border-b text-sm">
                        <div className="font-medium">{header}</div>
                        <div>
                          <select 
                            value={columnMapping[header] || ""} 
                            onChange={(e) => setColumnMapping({...columnMapping, [header]: e.target.value})}
                            className="w-full p-1 border rounded"
                          >
                            <option value="">Skip this column</option>
                            <option value="firstName">First Name</option>
                            <option value="lastName">Last Name</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="jobTitle">Job Title</option>
                          </select>
                        </div>
                        <div className="text-muted-foreground truncate">
                          {csvData[1]?.[index] || "No data"}
                        </div>
                        <div>
                          {(columnMapping[header] === "firstName" || columnMapping[header] === "lastName" || columnMapping[header] === "email") && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const newMapping = {...columnMapping};
                              delete newMapping[header];
                              setColumnMapping(newMapping);
                            }}
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Preview:</strong> {csvData.length - 1} contacts will be imported
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBulkImportOpen(false);
                setCsvData([]);
                setColumnMapping({});
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={performImport}
              disabled={csvData.length === 0 || bulkImportContacts.isPending}
              className="min-w-24"
            >
              {bulkImportContacts.isPending ? "Importing..." : "Import Contacts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Logging Dialog */}
      <Dialog open={isLogActivityOpen} onOpenChange={setIsLogActivityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>
              Record an interaction or note for this contact.
            </DialogDescription>
          </DialogHeader>
          <ActivityForm 
            contact={selectedContact}
            onSuccess={() => setIsLogActivityOpen(false)}
            createActivityMutation={createActivityMutation}
          />
        </DialogContent>
      </Dialog>

      {/* Task Creation Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to this contact.
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            contact={selectedContact}
            onSuccess={() => setIsCreateTaskOpen(false)}
            createTaskMutation={createTaskMutation}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

// Activity Form Schema
const activityFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
});

// Activity Form Component
const ActivityForm = ({ contact, onSuccess, createActivityMutation }: {
  contact: Contact | null;
  onSuccess: () => void;
  createActivityMutation: any;
}) => {
  const form = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      type: "call",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof activityFormSchema>) => {
    if (!contact) return;
    
    const activityData = {
      ...values,
      contactId: contact.id,
      companyId: contact.companyId,
    };
    
    createActivityMutation.mutate(activityData);
  };

  if (!contact) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder={`Activity for ${contact.firstName} ${contact.lastName}`}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Activity details..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={createActivityMutation.isPending}>
            {createActivityMutation.isPending ? "Logging..." : "Log Activity"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Task Form Schema
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
});

// Task Form Component
const TaskForm = ({ contact, onSuccess, createTaskMutation }: {
  contact: Contact | null;
  onSuccess: () => void;
  createTaskMutation: any;
}) => {
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    if (!contact) return;
    
    const taskData = {
      ...values,
      contactId: contact.id,
      companyId: contact.companyId,
      completed: false,
      dueDate: values.dueDate ? values.dueDate : null,
    };
    
    createTaskMutation.mutate(taskData);
  };

  if (!contact) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder={`Follow up with ${contact.firstName} ${contact.lastName}`}
                  {...field} 
                />
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
                  placeholder="Task details..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTaskMutation.isPending}>
            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Contacts;
