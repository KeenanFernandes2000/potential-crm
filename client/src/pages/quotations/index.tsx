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
import { PlusCircle, Pencil, Trash2, Send, FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
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
      return "default";
    case "Accepted":
      return "secondary";
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
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { data: quotations, isLoading } = useQuery<Quotation[]>({
    queryKey: ["/api/quotations"],
  });

  const { data: deals = [] } = useQuery<any[]>({
    queryKey: ["/api/deals"],
  });

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setIsCreateModalOpen(true);
  };

  const handlePreviewQuotation = (quotation: Quotation) => {
    setPreviewQuotation(quotation);
    setIsPreviewOpen(true);
  };

  const handleSendEmail = async (quotation: Quotation) => {
    try {
      const response = await apiRequest("POST", `/api/quotations/${quotation.id}/send`);
      
      if (response) {
        toast({
          title: "Success",
          description: `Quotation sent successfully`,
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
    if (!contact) return `Contact ${contactId}`;
    
    const leadType = contact.leadType ? ` (${contact.leadType})` : "";
    return `${contact.firstName} ${contact.lastName}${leadType}`;
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
                        onClick={() => handlePreviewQuotation(quotation)}
                        title="Preview"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
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

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Preview</DialogTitle>
            <DialogDescription>
              This is how your quotation will appear to the recipient
            </DialogDescription>
          </DialogHeader>
          
          {previewQuotation && (
            <div className="mt-4 border p-6 rounded-md bg-white">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{previewQuotation.title}</h2>
                  <p className="text-muted-foreground">
                    {previewQuotation.createdAt ? new Date(previewQuotation.createdAt).toLocaleDateString() : 'Today'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {companies.find(c => c.id === previewQuotation.companyId)?.name || 'Your Company'}
                  </p>
                  <p>
                    Valid until: {previewQuotation.validUntil ? new Date(previewQuotation.validUntil).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">To:</h3>
                <p>
                  {contacts.find(c => c.id === previewQuotation.contactId)?.firstName}{" "}
                  {contacts.find(c => c.id === previewQuotation.contactId)?.lastName}
                </p>
                <p>{contacts.find(c => c.id === previewQuotation.contactId)?.email}</p>
              </div>
              
              <div className="mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                      <th className="px-4 py-2 text-center font-medium">Qty</th>
                      <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                      <th className="px-4 py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.isArray(previewQuotation.items) 
                      ? previewQuotation.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">
                            {previewQuotation.currency} {Number(item.unitPrice).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {previewQuotation.currency} {(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                      : null
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-bold">
                        Total:
                      </td>
                      <td className="px-4 py-2 text-right font-bold">
                        {previewQuotation.currency} {Number(previewQuotation.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {previewQuotation.notes && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Notes:</h3>
                  <p className="whitespace-pre-wrap">{previewQuotation.notes}</p>
                </div>
              )}
              
              {previewQuotation.termsAndConditions && (
                <div>
                  <h3 className="font-medium mb-2">Terms and Conditions:</h3>
                  <p className="whitespace-pre-wrap text-sm">{previewQuotation.termsAndConditions}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                setIsPreviewOpen(false);
                handleSendEmail(previewQuotation!);
              }}
              disabled={previewQuotation?.emailSent}
            >
              Send Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
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