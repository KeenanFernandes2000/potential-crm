import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EmailTemplate, insertEmailTemplateSchema } from "@shared/schema";

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

const formSchema = insertEmailTemplateSchema;

type EmailTemplateFormValues = z.infer<typeof formSchema>;

interface EmailTemplateFormProps {
  template?: EmailTemplate | null;
  onClose: () => void;
}

export function EmailTemplateForm({ template, onClose }: EmailTemplateFormProps) {
  const { toast } = useToast();
  const isEditing = !!template;

  const defaultValues: Partial<EmailTemplateFormValues> = {
    name: template?.name || "",
    description: template?.description || "",
    subject: template?.subject || "",
    body: template?.body || "",
    fromName: template?.fromName || "",
    fromEmail: template?.fromEmail || "",
    replyTo: template?.replyTo || "",
  };

  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: EmailTemplateFormValues) => {
      if (isEditing) {
        return await apiRequest("PUT", `/api/email-templates/${template.id}`, data);
      } else {
        return await apiRequest("POST", "/api/email-templates", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: isEditing ? "Template updated" : "Template created",
        description: isEditing 
          ? "The email template has been updated successfully." 
          : "The email template has been created successfully.",
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

  const onSubmit = (data: EmailTemplateFormValues) => {
    createTemplateMutation.mutate(data);
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
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Welcome Email" {...field} />
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
                    <Input placeholder="Welcome to our platform!" {...field} />
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
                  <Input placeholder="Brief description of this template..." {...field} />
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
                    <Input placeholder="noreply@yourcompany.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Body</FormLabel>
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
              disabled={createTemplateMutation.isPending}
            >
              {createTemplateMutation.isPending ? "Saving..." : (isEditing ? "Update Template" : "Create Template")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}