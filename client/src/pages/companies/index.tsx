import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Company, Partner } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, Globe, Activity } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CompanyForm from "./CompanyForm";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Companies = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete company");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Company deleted",
        description: "The company has been successfully deleted.",
      });
      setShowDeleteDialog(false);
      setCompanyToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (company: Company) => {
    setCompanyToDelete(company);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      deleteMutation.mutate(companyToDelete.id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingCompany(null);
  };

  // Helper function to get partner name
  const getPartnerName = (partnerId: number | null) => {
    if (!partnerId || !partners) return "Direct";
    const partner = partners.find(p => p.id === partnerId);
    return partner?.name || "Direct";
  };

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => {
        const website = row.getValue("website") as string;
        if (!website) return "N/A";
        
        return (
          <a 
            href={website.startsWith("http") ? website : `https://${website}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-secondary-500 hover:underline"
          >
            <Globe className="h-4 w-4 mr-1" />
            {website}
          </a>
        );
      },
    },
    {
      accessorKey: "industry",
      header: "Industry",
    },
    {
      accessorKey: "size",
      header: "Size",
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "partnerId",
      header: "Partner",
      cell: ({ row }) => {
        const company = row.original;
        const partnerName = getPartnerName(company.partnerId);
        return (
          <Badge variant={company.partnerId ? "default" : "secondary"}>
            {partnerName}
          </Badge>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[];
        if (!tags || tags.length === 0) return null;
        
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="mr-1">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline">+{tags.length - 2}</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const company = row.original;
        
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
              <DropdownMenuItem onClick={() => handleEdit(company)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View contacts</DropdownMenuItem>
              <DropdownMenuItem>View deals</DropdownMenuItem>
              <DropdownMenuItem>Create deal</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDelete(company)}
              >
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
        <h1 className="text-2xl font-semibold">Companies</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Activity className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={companies || []} 
          searchColumn="name"
          searchPlaceholder="Search companies..."
        />
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <CompanyForm 
            company={editingCompany} 
            onClose={closeModal} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this company?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company
              "{companyToDelete?.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default Companies;
