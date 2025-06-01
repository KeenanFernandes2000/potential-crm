import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { List } from "@shared/schema";

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

const formSchema = z.object({
  listId: z.number().min(1, "Please select a contact list"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email content is required"),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Valid email address is required"),
});

type SendEmailFormValues = z.infer<typeof formSchema>;

interface SendEmailToListFormProps {
  onClose: () => void;
}

export function SendEmailToListForm({ onClose }: SendEmailToListFormProps) {
  const { toast } = useToast();

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });

  const defaultValues: Partial<SendEmailFormValues> = {
    subject: "",
    body: "",
    fromName: "Your Company",
    fromEmail: "",
  };

  const form = useForm<SendEmailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: SendEmailFormValues) => {
      return await apiRequest("POST", `/api/lists/${data.listId}/send-email`, {
        subject: data.subject,
        body: data.body,
        fromName: data.fromName,
        fromEmail: data.fromEmail,
      });
    },
    onSuccess: () => {
      toast({
        title: "Email sent successfully",
        description: "Your email has been sent to the selected contact list.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error sending email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SendEmailFormValues) => {
    sendEmailMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="listId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact List</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
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

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Your email subject" {...field} />
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

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your email message here..."
                  className="min-h-[150px]"
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
            disabled={sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </form>
    </Form>
  );
}