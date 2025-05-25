import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Quotation, insertQuotationSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { X, Plus, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

// Extended schema for the form with proper validation
const formSchema = insertQuotationSchema.extend({
  validUntil: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.coerce.number().min(0.01, "Unit price must be greater than 0"),
    })
  ).min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface QuotationFormProps {
  onClose: () => void;
  existingQuotation?: Quotation | null;
}

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

const defaultItem: LineItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
};

const statusOptions = ["Draft", "Sent", "Accepted", "Rejected", "Expired"];

const QuotationForm = ({ onClose, existingQuotation }: QuotationFormProps) => {
  const queryClient = useQueryClient();
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultItem]);
  const [totalAmount, setTotalAmount] = useState(0);

  const { data: deals, isLoading: isDealsLoading } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: contacts, isLoading: isContactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const { data: companies, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["/api/companies"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      dealId: undefined,
      contactId: undefined,
      companyId: undefined,
      amount: 0,
      currency: "USD",
      status: "Draft",
      validUntil: "",
      notes: "",
      termsAndConditions: "",
      items: [defaultItem],
    },
  });
  
  // Watch dealId to auto-populate company field
  const watchDealId = form.watch("dealId");

  // Initialize form with existing quotation data if provided
  useEffect(() => {
    if (existingQuotation) {
      const validUntil = existingQuotation.validUntil
        ? new Date(existingQuotation.validUntil).toISOString().split("T")[0]
        : "";

      const items = existingQuotation.items as LineItem[];
      setLineItems(items);

      form.reset({
        ...existingQuotation,
        validUntil,
        items,
      });

      calculateTotal(items);
    }
  }, [existingQuotation, form]);
  
  // Auto-populate company when deal is selected
  useEffect(() => {
    if (watchDealId && deals) {
      const selectedDeal = deals.find(deal => deal.id === watchDealId);
      if (selectedDeal && selectedDeal.companyId) {
        form.setValue("companyId", selectedDeal.companyId);
      }
    }
  }, [watchDealId, deals, form]);

  const calculateTotal = (items: LineItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    setTotalAmount(total);
    form.setValue("amount", total);
    return total;
  };

  const addLineItem = () => {
    const newItems = [...lineItems, { ...defaultItem }];
    setLineItems(newItems);
    form.setValue("items", newItems);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const newItems = lineItems.filter((_, i) => i !== index);
      setLineItems(newItems);
      form.setValue("items", newItems);
      calculateTotal(newItems);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems];
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    
    setLineItems(newItems);
    form.setValue("items", newItems);
    calculateTotal(newItems);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Calculate final amount based on line items
      const finalAmount = calculateTotal(values.items);
      values.amount = finalAmount;

      // Ensure all required fields are present
      if (!values.title || !values.dealId || !values.contactId) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Title, Deal, and Contact)",
          variant: "destructive",
        });
        return;
      }

      // Log what we're submitting to help debug
      console.log("Submitting quotation with values:", values);
      
      if (existingQuotation) {
        await apiRequest("PUT", `/api/quotations/${existingQuotation.id}`, values);
        toast({
          title: "Success",
          description: "Quotation updated successfully",
        });
      } else {
        await apiRequest("POST", "/api/quotations", values);
        toast({
          title: "Success",
          description: "Quotation created successfully",
        });
      }

      // Refresh quotations data
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      onClose();
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast({
        title: "Error",
        description: "Failed to save quotation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isDealsLoading || isContactsLoading || isCompaniesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quotation Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter quotation title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dealId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Deal</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const dealId = parseInt(value);
                    field.onChange(dealId);
                    
                    // Auto-fill company when deal is selected
                    if (dealId && deals) {
                      const selectedDeal = deals.find(deal => deal.id === dealId);
                      if (selectedDeal && selectedDeal.companyId) {
                        form.setValue("companyId", selectedDeal.companyId);
                      }
                    }
                  }}
                  defaultValue={
                    field.value ? field.value.toString() : undefined
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {deals?.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id.toString()}>
                        {deal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={
                    field.value ? field.value.toString() : undefined
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.firstName} {contact.lastName} {contact.leadType ? `(${contact.leadType})` : ""} - {contact.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={
                    field.value ? field.value.toString() : undefined
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Until</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Line Items</h3>

          {lineItems.map((item, index) => (
            <Card key={index} className="mb-4">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">Item {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                      placeholder="Item description"
                    />
                  </div>
                  <div>
                    <FormLabel>Quantity</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(index, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <FormLabel>Unit Price</FormLabel>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-8"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(index, "unitPrice", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">
                    Subtotal: {form.watch("currency") || "USD"}{" "}
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={addLineItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </Button>

          <div className="mt-4 text-right">
            <h4 className="text-lg font-semibold">
              Total: {form.watch("currency") || "USD"} {totalAmount.toFixed(2)}
            </h4>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about this quotation"
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAndConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms and Conditions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Terms and conditions for this quotation"
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {existingQuotation ? "Update Quotation" : "Create Quotation"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuotationForm;