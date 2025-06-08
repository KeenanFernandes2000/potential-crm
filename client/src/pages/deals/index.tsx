import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Deal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, Activity, Download, Filter, X } from "lucide-react";
import * as XLSX from 'xlsx';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DealForm from "./DealForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FilterState {
  status: string;
  company: string;
  partner: string;
  minValue: string;
  maxValue: string;
  search: string;
}

const Deals = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    company: 'all',
    partner: 'all',
    minValue: '',
    maxValue: '',
    search: '',
  });

  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });
  
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: partners } = useQuery({
    queryKey: ["/api/partners"],
  });

  // Filtered deals based on current filters
  const filteredDeals = useMemo(() => {
    if (!deals) return [];

    return deals.filter(deal => {
      // Search filter
      if (filters.search && !deal.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && deal.stage !== filters.status) {
        return false;
      }

      // Company filter
      if (filters.company !== 'all' && deal.companyId?.toString() !== filters.company) {
        return false;
      }

      // Partner filter
      if (filters.partner !== 'all') {
        const partnerName = getPartnerName(deal.companyId);
        if (partnerName !== filters.partner) {
          return false;
        }
      }

      // Value range filter
      if (filters.minValue && deal.value && deal.value < parseFloat(filters.minValue)) {
        return false;
      }
      if (filters.maxValue && deal.value && deal.value > parseFloat(filters.maxValue)) {
        return false;
      }

      return true;
    });
  }, [deals, filters, companies, partners]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      company: 'all',
      partner: 'all',
      minValue: '',
      maxValue: '',
      search: '',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.status !== 'all' || filters.company !== 'all' || filters.partner !== 'all' || filters.minValue !== '' || filters.maxValue !== '' || filters.search !== '';

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingDeal(null);
  };
  
  const { toast } = useToast();

  const handleDelete = async (dealId: number) => {
    try {
      await apiRequest("DELETE", `/api/deals/${dealId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/won-deals"] });
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
        return "default";
      case "Lost":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPartnerName = (companyId: number) => {
    if (!companies || !partners) return "Direct";
    
    const company = companies.find(c => c.id === companyId);
    if (!company?.partnerId) return "Direct";
    
    const partner = partners.find(p => p.id === company.partnerId);
    return partner ? partner.name : "Direct";
  };

  const exportToExcel = () => {
    if (!deals || !companies || !partners) return;

    const exportData = deals.map(deal => ({
      "Deal Name": deal.title,
      "Value": deal.value ? formatCurrency(deal.value, deal.currency || "USD") : "N/A",
      "Company": companies.find(c => c.id === deal.companyId)?.name || `Company ${deal.companyId}`,
      "Partner": getPartnerName(deal.companyId),
      "Contact": `Contact ${deal.contactId}`,
      "Stage": deal.stage,
      "Start Date": deal.startDate ? format(new Date(deal.startDate), "MMM d, yyyy") : "N/A",
      "Expiry Date": deal.expiryDate ? format(new Date(deal.expiryDate), "MMM d, yyyy") : "N/A",
      "Currency": deal.currency || "USD",
      "Notes": deal.notes || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deals");
    
    const fileName = `deals-export-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Export successful",
      description: `Deals have been exported to ${fileName}`,
    });
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const companyId = row.getValue("companyId") as number;
        
        if (!companies || companies.length === 0) {
          return `Company ${companyId}`;
        }
        
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : `Company ${companyId}`;
      },
      sortingFn: (rowA, rowB) => {
        const companyIdA = rowA.getValue("companyId") as number;
        const companyIdB = rowB.getValue("companyId") as number;
        
        if (!companies || companies.length === 0) {
          return companyIdA - companyIdB;
        }
        
        const companyA = companies.find((c: any) => c.id === companyIdA);
        const companyB = companies.find((c: any) => c.id === companyIdB);
        
        const nameA = companyA ? companyA.name : `Company ${companyIdA}`;
        const nameB = companyB ? companyB.name : `Company ${companyIdB}`;
        
        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "partner",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Partner
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const companyId = row.getValue("companyId") as number;
        return getPartnerName(companyId);
      },
      sortingFn: (rowA, rowB) => {
        const partnerA = getPartnerName(rowA.getValue("companyId"));
        const partnerB = getPartnerName(rowB.getValue("companyId"));
        return partnerA.localeCompare(partnerB);
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportToExcel}
            disabled={!filteredDeals || filteredDeals.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search deals..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            View
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.values(filters).filter(v => v !== '').length}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="Inquiry">Inquiry</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Negotiation">Negotiation</SelectItem>
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Company</label>
                  <Select value={filters.company} onValueChange={(value) => setFilters(prev => ({ ...prev, company: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All companies</SelectItem>
                      {companies && Array.isArray(companies) && companies.map((company: any) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Partner</label>
                  <Select value={filters.partner} onValueChange={(value) => setFilters(prev => ({ ...prev, partner: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All partners" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All partners</SelectItem>
                      <SelectItem value="Direct">Direct</SelectItem>
                      {partners && Array.isArray(partners) && partners.map((partner: any) => (
                        <SelectItem key={partner.id} value={partner.name}>
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Value</label>
                  <Input
                    type="number"
                    placeholder="Min value"
                    value={filters.minValue}
                    onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Value</label>
                  <Input
                    type="number"
                    placeholder="Max value"
                    value={filters.maxValue}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredDeals.length} of {deals?.length || 0} deals
          {hasActiveFilters && (
            <span className="ml-2 text-blue-600">
              (filtered)
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Activity className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredDeals} 
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
