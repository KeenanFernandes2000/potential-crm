import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, FileUp, FileDown, Activity } from "lucide-react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Contacts = () => {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsCreateModalOpen(true);
  };

  const handleExport = () => {
    toast({
      title: "Exporting contacts",
      description: "Your contacts will be exported as a CSV file shortly.",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import contacts",
      description: "This feature is coming soon.",
    });
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
