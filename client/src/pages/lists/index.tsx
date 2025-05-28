import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { List, insertListSchema, InsertList, Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, Tags, Activity, Edit, Eye, Download, Trash2, Upload } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";

const Lists = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageContactsOpen, setIsManageContactsOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [managingList, setManagingList] = useState<List | null>(null);
  const [importingList, setImportingList] = useState<List | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const { data: lists, isLoading } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const form = useForm<InsertList>({
    resolver: zodResolver(insertListSchema),
    defaultValues: {
      name: "",
      description: "",
      isDynamic: false,
      criteria: null,
    },
  });

  const createListMutation = useMutation({
    mutationFn: (data: InsertList) => apiRequest("/api/lists", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "List created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create list",
        variant: "destructive",
      });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertList }) => 
      apiRequest(`/api/lists/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setIsEditDialogOpen(false);
      setEditingList(null);
      form.reset();
      toast({
        title: "Success",
        description: "List updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update list",
        variant: "destructive",
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/lists/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      toast({
        title: "Success",
        description: "List deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete list",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertList) => {
    if (editingList) {
      updateListMutation.mutate({ id: editingList.id, data });
    } else {
      createListMutation.mutate(data);
    }
  };

  const handleEdit = (list: List) => {
    setEditingList(list);
    form.reset({
      name: list.name,
      description: list.description || "",
      isDynamic: list.isDynamic || false,
      criteria: list.criteria as any,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (list: List) => {
    if (confirm(`Are you sure you want to delete "${list.name}"? This action cannot be undone.`)) {
      deleteListMutation.mutate(list.id);
    }
  };

  const handleManageContacts = (list: List) => {
    setManagingList(list);
    setSelectedContacts([]);
    setIsManageContactsOpen(true);
  };

  const addContactsToList = useMutation({
    mutationFn: ({ listId, contactIds }: { listId: number; contactIds: number[] }) => 
      apiRequest(`/api/lists/${listId}/contacts`, "POST", { contactIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setIsManageContactsOpen(false);
      setSelectedContacts([]);
      toast({
        title: "Success",
        description: "Contacts added to list successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add contacts to list",
        variant: "destructive",
      });
    },
  });

  const handleAddContactsToList = () => {
    if (managingList && selectedContacts.length > 0) {
      addContactsToList.mutate({ 
        listId: managingList.id, 
        contactIds: selectedContacts 
      });
    }
  };

  const handleBulkImport = (list: List) => {
    setImportingList(list);
    setCsvFile(null);
    setCsvData([]);
    setColumnMapping({});
    setIsBulkImportOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        setCsvData(rows);
        // Initialize column mapping
        if (rows.length > 0) {
          const headers = rows[0];
          const mapping: {[key: string]: string} = {};
          headers.forEach((header, index) => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('first') || lowerHeader.includes('fname')) {
              mapping[`column_${index}`] = 'firstName';
            } else if (lowerHeader.includes('last') || lowerHeader.includes('lname')) {
              mapping[`column_${index}`] = 'lastName';
            } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
              mapping[`column_${index}`] = 'email';
            } else if (lowerHeader.includes('phone')) {
              mapping[`column_${index}`] = 'phone';
            }
          });
          setColumnMapping(mapping);
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const bulkImportContacts = useMutation({
    mutationFn: async ({ listId, contacts }: { listId: number; contacts: any[] }) => {
      return apiRequest(`/api/lists/${listId}/bulk-import`, "POST", { contacts });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsBulkImportOpen(false);
      toast({
        title: "Success",
        description: "Contacts imported successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import contacts",
        variant: "destructive",
      });
    },
  });

  const handleImportContacts = () => {
    if (!importingList || !csvData.length) return;

    const [headers, ...dataRows] = csvData;
    const contacts = dataRows
      .filter(row => row.some(cell => cell.trim())) // Filter out empty rows
      .map(row => {
        const contact: any = {};
        headers.forEach((header, index) => {
          const mappedField = columnMapping[`column_${index}`];
          if (mappedField && row[index]) {
            contact[mappedField] = row[index].trim();
          }
        });
        return contact;
      })
      .filter(contact => contact.email); // Only import contacts with email

    if (contacts.length === 0) {
      toast({
        title: "Error",
        description: "No valid contacts found. Make sure email column is mapped correctly.",
        variant: "destructive",
      });
      return;
    }

    bulkImportContacts.mutate({ listId: importingList.id, contacts });
  };

  const columns: ColumnDef<List>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            List Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description || "No description";
      },
    },
    {
      accessorKey: "isDynamic",
      header: "Type",
      cell: ({ row }) => {
        const isDynamic = row.getValue("isDynamic") as boolean;
        return (
          <div className="flex items-center">
            <Switch 
              checked={isDynamic} 
              disabled
              className="mr-2" 
            />
            <span>{isDynamic ? "Dynamic" : "Static"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "contactCount",
      header: "Contacts",
      cell: ({ row }) => {
        const list = row.original;
        // TODO: This should fetch actual contact count from the API
        return "0";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        if (!date) return "N/A";
        
        return format(new Date(date), "MMM d, yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const list = row.original;
        
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
              <DropdownMenuItem onClick={() => handleEdit(list)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleManageContacts(list)}>
                <Eye className="mr-2 h-4 w-4" />
                Manage contacts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkImport(list)}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk import contacts
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export contacts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600" 
                onClick={() => handleDelete(list)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const CreateListDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Create a new contact list to organize your contacts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter list name..." {...field} />
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
                      placeholder="Enter list description..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isDynamic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Dynamic List</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Automatically update based on criteria
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createListMutation.isPending}
              >
                {createListMutation.isPending ? "Creating..." : "Create List"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const EditListDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
          <DialogDescription>
            Update the list details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter list name..." {...field} />
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
                      placeholder="Enter list description..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isDynamic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Dynamic List</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Automatically update based on criteria
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateListMutation.isPending}
              >
                {updateListMutation.isPending ? "Updating..." : "Update List"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Lists</h1>
        <CreateListDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Activity className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={lists || []} 
          searchColumn="name"
          searchPlaceholder="Search lists..."
        />
      )}

      <EditListDialog />

      {/* Manage Contacts Dialog */}
      <Dialog open={isManageContactsOpen} onOpenChange={setIsManageContactsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Contacts - {managingList?.name}</DialogTitle>
            <DialogDescription>
              Select contacts to add to this list.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {contacts && contacts.length > 0 ? (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContacts([...selectedContacts, contact.id]);
                        } else {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No contacts available. Create some contacts first to add them to lists.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsManageContactsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleAddContactsToList}
              disabled={selectedContacts.length === 0 || addContactsToList.isPending}
            >
              {addContactsToList.isPending ? "Adding..." : `Add ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Bulk Import Contacts - {importingList?.name}</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple contacts into this list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="csvFile" className="text-sm font-medium">
                Select CSV File
              </label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected format: CSV with columns like First Name, Last Name, Email, Phone
              </p>
            </div>

            {csvData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Map CSV Columns</h4>
                <div className="grid grid-cols-2 gap-4">
                  {csvData[0].map((header, index) => (
                    <div key={index} className="space-y-1">
                      <label className="text-xs text-gray-600">
                        CSV Column: "{header}"
                      </label>
                      <select
                        value={columnMapping[`column_${index}`] || ''}
                        onChange={(e) => setColumnMapping({
                          ...columnMapping,
                          [`column_${index}`]: e.target.value
                        })}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Skip this column</option>
                        <option value="firstName">First Name</option>
                        <option value="lastName">Last Name</option>
                        <option value="email">Email *</option>
                        <option value="phone">Phone</option>
                        <option value="jobTitle">Job Title</option>
                        <option value="company">Company</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h5 className="text-sm font-medium mb-2">Preview (first 3 rows)</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          {csvData[0].map((header, index) => (
                            <th key={index} className="border p-1 bg-gray-100 text-left">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(1, 4).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border p-1">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Total rows: {csvData.length - 1} contacts
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsBulkImportOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleImportContacts}
              disabled={!csvData.length || !Object.values(columnMapping).includes('email') || bulkImportContacts.isPending}
            >
              {bulkImportContacts.isPending ? "Importing..." : "Import Contacts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Lists;
