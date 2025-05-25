import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowLeft, Download, Activity } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FormSubmissions = () => {
  const { id } = useParams();
  const formId = parseInt(id);
  const [exportData, setExportData] = useState<string>("");
  const [form, setForm] = useState<any>(null);
  
  // Get form details
  const { data: formData, isLoading: formLoading } = useQuery({
    queryKey: [`/api/forms/${formId}`],
    enabled: !isNaN(formId),
  });
  
  // Get form submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: [`/api/forms/${formId}/submissions`],
    enabled: !isNaN(formId),
  });
  
  useEffect(() => {
    if (formData) {
      setForm(formData);
    }
  }, [formData]);
  
  // Export submissions to CSV
  const handleExport = () => {
    if (!submissions || submissions.length === 0) return;
    
    // Get all field keys from submissions
    const allFields = new Set<string>();
    submissions.forEach((submission: any) => {
      Object.keys(submission.data).forEach(key => allFields.add(key));
    });
    
    // Create CSV headers
    const headers = ["Submission ID", "Date", "IP Address", ...Array.from(allFields)];
    
    // Create CSV rows
    const rows = submissions.map((submission: any) => {
      const baseData = [
        submission.id,
        format(new Date(submission.createdAt), "yyyy-MM-dd HH:mm:ss"),
        submission.sourceInfo?.ip || "Unknown"
      ];
      
      // Add field data
      const fieldData = Array.from(allFields).map(field => {
        return submission.data[field] || "";
      });
      
      return [...baseData, ...fieldData].map(value => {
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",");
    });
    
    // Combine headers and rows
    const csv = [headers.join(","), ...rows].join("\n");
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-${formId}-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Dynamic columns based on submission data fields
  const createColumns = (): ColumnDef<any>[] => {
    if (!submissions || submissions.length === 0) {
      return [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "createdAt", header: "Submitted At" }
      ];
    }
    
    // Base columns
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span>#{row.original.id}</span>,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Submitted At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return date ? format(new Date(date), "MMM d, yyyy h:mm a") : "N/A";
        },
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => {
          const sourceInfo = row.original.sourceInfo || {};
          return sourceInfo.referrer || "Direct";
        },
      }
    ];
    
    // Dynamically add columns based on form fields
    const fieldColumns: ColumnDef<any>[] = [];
    
    if (form && form.fields) {
      // Add columns for each form field
      form.fields.forEach((field: any) => {
        fieldColumns.push({
          accessorKey: `data.${field.name}`,
          header: field.label || field.name,
          cell: ({ row }) => {
            const value = row.original.data[field.name];
            if (Array.isArray(value)) {
              return value.join(", ");
            }
            return value || "N/A";
          }
        });
      });
    } else {
      // If form fields aren't available, try to get fields from first submission
      const firstSubmission = submissions[0];
      if (firstSubmission && firstSubmission.data) {
        Object.keys(firstSubmission.data).forEach(key => {
          fieldColumns.push({
            accessorKey: `data.${key}`,
            header: key,
            cell: ({ row }) => {
              const value = row.original.data[key];
              if (Array.isArray(value)) {
                return value.join(", ");
              }
              return value || "N/A";
            }
          });
        });
      }
    }
    
    return [...baseColumns, ...fieldColumns];
  };
  
  const columns = createColumns();
  const isLoading = formLoading || submissionsLoading;
  
  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/forms">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">
            {form ? form.name : "Form"} Submissions
          </h1>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={!submissions || submissions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Activity className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {submissions ? submissions.length : 0}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Form Created</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-md">
                  {form && form.createdAt 
                    ? format(new Date(form.createdAt), "MMM d, yyyy") 
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-md">
                  {submissions && submissions.length > 0 
                    ? format(new Date(submissions[0].createdAt), "MMM d, yyyy h:mm a") 
                    : "No submissions yet"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {submissions && submissions.length > 0 ? (
            <DataTable 
              columns={columns} 
              data={submissions} 
              searchColumn="data"
              searchPlaceholder="Search submissions..."
            />
          ) : (
            <div className="text-center p-10 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-xl font-semibold mb-2">No submissions yet</p>
              <p className="text-gray-600 dark:text-gray-400">
                When users fill out this form, submissions will appear here.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default FormSubmissions;