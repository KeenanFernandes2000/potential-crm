import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { List } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, Tags, Activity } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

const Lists = () => {
  const { data: lists, isLoading } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });

  const columns: ColumnDef<List>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            List Name
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
      accessorKey: "isDynamic",
      header: "Type",
      cell: ({ row }) => {
        const isDynamic = row.getValue("isDynamic") as boolean;
        return (
          <div className="flex items-center">
            <Switch 
              checked={isDynamic} 
              disabled
              className="mr-2" 
            />
            <span>{isDynamic ? "Dynamic" : "Static"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "contactCount",
      header: "Contacts",
      cell: ({ row }) => {
        // In a real app, this would be the count of contacts in the list
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
        const list = row.original;
        
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
              <DropdownMenuItem>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>View contacts</DropdownMenuItem>
              <DropdownMenuItem>Export contacts</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Lists</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create List
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Activity className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={lists || []} 
          searchColumn="name"
          searchPlaceholder="Search lists..."
        />
      )}
    </section>
  );
};

export default Lists;
