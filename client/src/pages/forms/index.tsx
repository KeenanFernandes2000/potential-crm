import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Form } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, Copy, Activity, ExternalLink } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import FormForm from "./FormForm";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Forms = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formToEdit, setFormToEdit] = useState<Form | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewFormId, setPreviewFormId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedFormId, setEmbedFormId] = useState<number | null>(null);

  const { data: forms, isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/forms/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      toast({
        title: "Form deleted",
        description: "The form has been deleted successfully.",
      });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateForm = () => {
    setFormToEdit(null);
    setShowFormDialog(true);
  };

  const handleEditForm = (form: Form) => {
    setFormToEdit(form);
    setShowFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setShowFormDialog(false);
    setFormToEdit(null);
  };

  const handlePreviewForm = (formId: number) => {
    setPreviewFormId(formId);
    setShowPreviewDialog(true);
  };

  const handleDeleteForm = (form: Form) => {
    setFormToDelete(form);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (formToDelete) {
      deleteMutation.mutate(formToDelete.id);
    }
  };

  const handleCopyEmbedCode = (formId: number) => {
    // Base URL would be the actual deployment URL in production
    const baseUrl = window.location.origin;
    const embedCode = `<iframe src="${baseUrl}/forms/embed/${formId}" width="100%" height="500" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied",
      description: "The form embed code has been copied to your clipboard.",
    });
  };

  const handleShowEmbedInfo = (formId: number) => {
    setEmbedFormId(formId);
    setShowEmbedDialog(true);
  };

  const columns: ColumnDef<Form>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Form Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description || "No description";
      },
    },
    {
      accessorKey: "fieldCount",
      header: "Fields",
      cell: ({ row }) => {
        const fields = row.original.fields as any[];
        return fields?.length || 0;
      },
    },
    {
      accessorKey: "submissionCount",
      header: "Submissions",
      cell: ({ row }) => {
        // In a real app, this would be the count of submissions
        return Math.floor(Math.random() * 100);
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        if (!date) return "N/A";
        
        return format(new Date(date), "MMM d, yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const form = row.original;
        
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
              <DropdownMenuItem onClick={() => handleEditForm(form)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>View submissions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopyEmbedCode(form.id)}>
                Copy embed code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShowEmbedInfo(form.id)}>
                Embed instructions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePreviewForm(form.id)}>
                Preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDeleteForm(form)}
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
    <>
      <section className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Forms</h1>
          <Button onClick={handleCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Activity className="h-8 w-8 animate-spin text-secondary-500" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={forms || []} 
            searchColumn="name"
            searchPlaceholder="Search forms..."
          />
        )}
      </section>

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-4xl p-0 overflow-auto max-h-[95vh]">
          <FormForm onClose={handleCloseFormDialog} existingForm={formToEdit} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this form?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form
              and all its submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Embed Instructions Dialog */}
      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <DialogContent className="max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Embed Your Form</h2>
            <p className="mb-4">
              You can embed this form on any website by copying and pasting the following HTML code:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4 overflow-x-auto">
              <code className="text-sm">
                {`<iframe src="${window.location.origin}/forms/embed/${embedFormId}" width="100%" height="500" frameborder="0"></iframe>`}
              </code>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Embed Options</h3>
              <div>
                <h4 className="text-md font-medium">Width and Height</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can adjust the width and height attributes to fit your website layout.
                </p>
              </div>
              <div>
                <h4 className="text-md font-medium">Responsive Embed</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  To make the form responsive, wrap it in a container like this:
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                  <code className="text-sm whitespace-pre-wrap">
{`<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
  <iframe 
    src="${window.location.origin}/forms/embed/${embedFormId}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    frameborder="0"
  ></iframe>
</div>`}
                  </code>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => handleCopyEmbedCode(embedFormId || 0)}
                className="mr-2"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Embed Code
              </Button>
              <Button onClick={() => setShowEmbedDialog(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Forms;
