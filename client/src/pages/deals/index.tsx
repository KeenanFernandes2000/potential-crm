import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Deal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, Activity } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import DealForm from "./DealForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Deals = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingDeal(null);
  };
  
  const handleDelete = async (dealId: number) => {
    try {
      await apiRequest("DELETE", `/api/deals/${dealId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Deal deleted",
        description: "The deal has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the deal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value?: number, currency = "USD") => {
    if (value === undefined) return "N/A";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case "Inquiry":
        return "outline";
      case "Qualified":
        return "secondary";
      case "Proposal":
        return "default";
      case "Negotiation":
        return "default";
      case "Won":
        return "success";
      case "Lost":
        return "destructive";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<Deal>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deal Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const currency = row.original.currency || "USD";
        
        return formatCurrency(value, currency);
      },
    },
    {
      accessorKey: "companyId",
      header: "Company",
      cell: ({ row }) => {
        // In a real app, you would need to fetch company details or use data from a join
        return `Company ${row.getValue("companyId")}`;
      },
    },
    {
      accessorKey: "contactId",
      header: "Contact",
      cell: ({ row }) => {
        // In a real app, you would need to fetch contact details or use data from a join
        return `Contact ${row.getValue("contactId")}`;
      },
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => {
        const stage = row.getValue("stage") as string;
        const variant = getStageBadgeVariant(stage);
        
        return <Badge variant={variant}>{stage}</Badge>;
      },
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry",
      cell: ({ row }) => {
        const expiryDate = row.getValue("expiryDate") as string;
        if (!expiryDate) return "N/A";
        
        return format(new Date(expiryDate), "MMM d, yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const deal = row.original;
        
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
              <DropdownMenuItem onClick={() => handleEdit(deal)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Move to next stage</DropdownMenuItem>
              <DropdownMenuItem>Mark as won</DropdownMenuItem>
              <DropdownMenuItem>Mark as lost</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDelete(deal.id)}
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
        <h1 className="text-2xl font-semibold">Deals</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Activity className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={deals || []} 
          searchColumn="title"
          searchPlaceholder="Search deals..."
        />
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DealForm 
            deal={editingDeal} 
            onClose={closeModal} 
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Deals;
