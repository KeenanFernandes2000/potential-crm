import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Bulk import mutation
  const bulkImportContacts = useMutation({
    mutationFn: (contactsData: any[]) => 
      apiRequest("/api/contacts/bulk-import", "POST", { contacts: contactsData }),
    onSuccess: (data) => {
      toast({
        title: "Import successful",
        description: `Successfully imported ${data.importedCount} contacts`,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const data = lines.map(line => {
        // Simple CSV parsing (handles basic cases)
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        return values;
      });
      
      setCsvData(data);
      setColumnMapping({});
    };
    reader.readAsText(file);
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
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Add to list</DropdownMenuItem>
              <DropdownMenuItem>Create task</DropdownMenuItem>
              <DropdownMenuItem>Log activity</DropdownMenuItem>
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
    </section>
  );
};

export default Contacts;
