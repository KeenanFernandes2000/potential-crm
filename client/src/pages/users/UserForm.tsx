import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, insertUserSchema } from "@shared/schema";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

const formSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

const UserForm = ({ user, onClose }: UserFormProps) => {
  const { toast } = useToast();
  const isEditing = !!user;

  const defaultValues: Partial<UserFormValues> = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    role: user?.role || "user",
    isActive: user?.isActive ?? true,
    password: "",
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      if (isEditing) {
        // Remove password if empty during edit
        const updateData = { ...data };
        if (!updateData.password) {
          delete updateData.password;
        }
        return await apiRequest("PUT", `/api/users/${user.id}`, updateData);
      } else {
        return await apiRequest("POST", "/api/users", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: isEditing ? "User updated" : "User created",
        description: isEditing 
          ? "The user has been updated successfully." 
          : "The user has been created successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormValues) => {
    createUserMutation.mutate(data);
  };

  return (
    <div>
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isEditing ? "Edit User" : "Add New User"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password {isEditing && "(leave blank to keep current password)"}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={isEditing ? "Enter new password" : "Enter password"} 
                    type="password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Active User
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    User can log in and access the system
                  </p>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update User" : "Create User")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserForm;