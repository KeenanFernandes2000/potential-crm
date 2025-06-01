import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EmailCampaign, insertEmailCampaignSchema, List } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = insertEmailCampaignSchema;

type EmailCampaignFormValues = z.infer<typeof formSchema>;

interface EmailCampaignFormProps {
  campaign?: EmailCampaign | null;
  onClose: () => void;
}

export function EmailCampaignForm({ campaign, onClose }: EmailCampaignFormProps) {
  const { toast } = useToast();
  const isEditing = !!campaign;

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });

  const defaultValues: Partial<EmailCampaignFormValues> = {
    name: campaign?.name || "",
    description: campaign?.description || "",
    subject: campaign?.subject || "",
    body: campaign?.body || "",
    fromName: campaign?.fromName || "",
    fromEmail: campaign?.fromEmail || "",
    replyTo: campaign?.replyTo || "",
    listId: campaign?.listId || null,
    status: campaign?.status || "Draft",
  };

  const form = useForm<EmailCampaignFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: EmailCampaignFormValues) => {
      if (isEditing) {
        return await apiRequest("PUT", `/api/email-campaigns/${campaign.id}`, data);
      } else {
        return await apiRequest("POST", "/api/email-campaigns", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      toast({
        title: isEditing ? "Campaign updated" : "Campaign created",
        description: isEditing 
          ? "The email campaign has been updated successfully." 
          : "The email campaign has been created successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailCampaignFormValues) => {
    createCampaignMutation.mutate(data);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly Newsletter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Line</FormLabel>
                  <FormControl>
                    <Input placeholder="Your monthly update" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Brief description of this campaign..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input placeholder="newsletter@yourcompany.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="replyTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reply To (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="support@yourcompany.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="listId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target List (Optional)</FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : ""}
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact list" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your email content here..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? "Saving..." : (isEditing ? "Update Campaign" : "Create Campaign")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}