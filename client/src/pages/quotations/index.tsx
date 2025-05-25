import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Send, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Quotation } from "@shared/schema";
import QuotationForm from "./QuotationForm";
import { formatCurrency } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";

const getStatusBadgeVariant = (status: QuotationStatus | null) => {
  switch(status) {
    case "Draft":
      return "secondary";
    case "Sent":
      return "primary";
    case "Accepted":
      return "success";
    case "Rejected":
      return "destructive";
    case "Expired":
      return "outline";
    default:
      return "secondary";
  }
};

const Quotations = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  
  const { data: quotations, isLoading } = useQuery<Quotation[]>({
    queryKey: ["/api/quotations"],
  });

  const { data: deals } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
  });

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setIsCreateModalOpen(true);
  };

  const handleSendEmail = async (quotation: Quotation) => {
    try {
      const response = await apiRequest("POST", `/api/quotations/${quotation.id}/send`);
      
      if (response) {
        toast({
          title: "Success",
          description: `Quotation sent to ${response.emailSentTo}`,
        });
        
        // Refresh quotations
        queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quotation email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingQuotation(null);
  };
  
  const handleDelete = async (quotationId: number) => {
    try {
      await apiRequest("DELETE", `/api/quotations/${quotationId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({
        title: "Quotation deleted",
        description: "The quotation has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the quotation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDealTitle = (dealId: number) => {
    if (!deals) return `Deal ${dealId}`;
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.title : `Deal ${dealId}`;
  };

  const getContactName = (contactId: number) => {
    if (!contacts) return `Contact ${contactId}`;
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : `Contact ${contactId}`;
  };

  const getCompanyName = (companyId: number | null) => {
    if (!companyId || !companies) return "N/A";
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : `Company ${companyId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">
            Manage your quotations and send to prospects
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Deal</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations && quotations.length > 0 ? (
              quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.title}</TableCell>
                  <TableCell>{getDealTitle(quotation.dealId)}</TableCell>
                  <TableCell>{getContactName(quotation.contactId)}</TableCell>
                  <TableCell>{getCompanyName(quotation.companyId)}</TableCell>
                  <TableCell>{formatCurrency(quotation.amount, quotation.currency || "USD")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(quotation.status as QuotationStatus)}>
                      {quotation.status || "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {quotation.validUntil 
                      ? new Date(quotation.validUntil).toLocaleDateString() 
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(quotation)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSendEmail(quotation)}
                        title="Send Email"
                        disabled={quotation.emailSent}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(quotation.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No quotations found</p>
                    <Button 
                      variant="outline" 
                      className="mt-3" 
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Create your first quotation
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuotation ? "Edit Quotation" : "Create New Quotation"}
            </DialogTitle>
            <DialogDescription>
              {editingQuotation 
                ? "Update the quotation details below" 
                : "Enter the details for the new quotation"}
            </DialogDescription>
          </DialogHeader>
          <QuotationForm 
            onClose={closeModal} 
            existingQuotation={editingQuotation} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotations;