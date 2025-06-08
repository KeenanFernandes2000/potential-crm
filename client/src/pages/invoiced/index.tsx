import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { InvoiceForm } from "./InvoiceForm";
import type { Invoice, Deal, Company } from "@shared/schema";

interface InvoiceWithDeal extends Invoice {
  deal?: Deal;
  company?: Company;
}

const formatCurrency = (amount: number | null, currency: string = "USD") => {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100); // Assuming amount is stored in cents
};

const getStatusColor = (status: string | null) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Under Processing":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Not sent":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function Invoiced() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: wonDeals, refetch: refetchWonDeals } = useQuery<Deal[]>({
    queryKey: ["/api/invoices/won-deals"],
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Combine invoices with deal and company information
  const invoicesWithDetails = useMemo(() => {
    if (!invoices || !wonDeals || !companies) return [];
    
    return invoices.map(invoice => {
      const deal = wonDeals.find(d => d.id === invoice.dealId);
      const company = deal ? companies.find(c => c.id === deal.companyId) : undefined;
      
      return {
        ...invoice,
        deal,
        company,
      } as InvoiceWithDeal;
    });
  }, [invoices, wonDeals, companies]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (invoiceId: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(invoiceId);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingInvoice(null);
  };

  if (invoicesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading invoices...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Invoiced Deals</h1>
          <p className="text-muted-foreground">
            Manage invoices for your won deals
          </p>
        </div>
        <Button onClick={() => {
          refetchWonDeals(); // Refresh won deals to get the latest data
          setIsCreateModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {!invoicesWithDetails || invoicesWithDetails.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No invoices found</CardTitle>
            <CardDescription>
              Create your first invoice for a won deal to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoicesWithDetails.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">
                        Invoice #{invoice.id}
                      </h3>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Deal</p>
                        <p className="font-medium">
                          {invoice.deal?.title || `Deal #${invoice.dealId}`}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground mb-1">Company</p>
                        <p className="font-medium">
                          {invoice.company?.name || "Unknown Company"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground mb-1">Amount</p>
                        <p className="font-medium text-lg">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground mb-1">Invoice Date</p>
                        <p className="font-medium">
                          {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {invoice.notes && (
                      <div className="mt-3">
                        <p className="text-muted-foreground text-sm mb-1">Notes</p>
                        <p className="text-sm">{invoice.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(invoice.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <InvoiceForm
          isOpen={isCreateModalOpen}
          onClose={closeModal}
          invoice={editingInvoice}
          wonDeals={wonDeals || []}
        />
      )}
    </section>
  );
}