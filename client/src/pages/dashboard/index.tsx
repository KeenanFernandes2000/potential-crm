import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StatisticCard } from "@/components/ui/statistic-card";
import { SalesPipeline, PipelineStage } from "@/components/ui/sales-pipeline";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { TaskList } from "@/components/dashboard/TaskList";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Users, 
  DollarSign, 
  BarChart3, 
  Activity,
  Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task, Activity as ActivityType } from "@shared/schema";

const Dashboard = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Reset form when dialog opens
  const handleOpenAddTask = () => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    form.reset({
      title: "",
      description: "",
      priority: "Medium",
      completed: false,
      dueDate: formattedDate,
    });
    setIsAddTaskOpen(true);
  };

  const taskFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.string().default("Medium"),
    completed: z.boolean().default(false),
    dueDate: z.string().min(1, "Due date is required"),
  });

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      completed: false,
      dueDate: "",
    },
  });

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsAddTaskOpen(false);
      form.reset();
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update task completion status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "The task status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleTaskComplete = (id: number, completed: boolean) => {
    updateTaskMutation.mutate({ id, completed });
  };

  const handleTaskDelete = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  const onSubmit = (data: z.infer<typeof taskFormSchema>) => {
    createTaskMutation.mutate(data);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export');
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `crm-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your CRM data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Pipeline stages data - will be calculated from real deals data
  const pipelineStages: PipelineStage[] = stats?.pipelineStages || [
    { name: "New Leads", count: 0, percentage: 0 },
    { name: "Qualified", count: 0, percentage: 0 },
    { name: "Proposal", count: 0, percentage: 0 },
    { name: "Negotiation", count: 0, percentage: 0, isLast: true },
    { name: "Closed Won", count: 0, percentage: 0, isWon: true },
  ];

  return (
    <section id="dashboard" className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <DateRangePicker 
            dateRange={dateRange} 
            setDateRange={setDateRange} 
          />
          <Button variant="secondary" className="flex items-center" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatisticCard
          title="Invoices Not Sent USD"
          value={statsLoading ? "Loading..." : stats?.invoicesNotSent || "$0"}
          change={0}
          icon={DollarSign}
          iconColor="text-red-500"
          iconBgColor="bg-red-100"
        />
        <StatisticCard
          title="Open Deals"
          value={statsLoading ? "Loading..." : stats?.openDeals?.toString() || "0"}
          change={stats?.openDealsChange || 0}
          icon={DollarSign}
          iconColor="text-accent-500"
          iconBgColor="bg-accent-100"
        />
        <StatisticCard
          title="Invoices Under Processing USD"
          value={statsLoading ? "Loading..." : stats?.invoicesUnderProcessing || "$0"}
          change={0}
          icon={DollarSign}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-100"
        />
        <StatisticCard
          title="Conversion Rate"
          value={statsLoading ? "Loading..." : stats?.conversionRate || "0%"}
          change={stats?.conversionRateChange || 0}
          icon={BarChart3}
          iconColor="text-primary-500"
          iconBgColor="bg-primary-100"
        />
      </div>

      {/* Funnel Value Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatisticCard
          title="Direct Deals"
          value={statsLoading ? "Loading..." : stats?.funnelBreakdown?.direct?.formatted || "$0"}
          change={0}
          icon={DollarSign}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-100"
          description={`${stats?.funnelBreakdown?.direct?.percentage || 0}% of total funnel`}
        />
        <StatisticCard
          title="Partner Deals"
          value={statsLoading ? "Loading..." : stats?.funnelBreakdown?.partner?.formatted || "$0"}
          change={0}
          icon={Users}
          iconColor="text-green-500"
          iconBgColor="bg-green-100"
          description={`${stats?.funnelBreakdown?.partner?.percentage || 0}% of total funnel`}
        />
        <StatisticCard
          title="Total Funnel Value"
          value={statsLoading ? "Loading..." : stats?.funnelBreakdown?.total?.formatted || "$0"}
          change={0}
          icon={BarChart3}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-100"
          description="All active deals"
        />
      </div>

      {/* Sales Pipeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Sales Pipeline</h2>
        <SalesPipeline stages={pipelineStages} />
      </div>

      {/* Recent Activities and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <a href="#" className="text-sm text-secondary-500 hover:text-secondary-700">View All</a>
          </div>
          {activitiesLoading ? (
            <div className="flex justify-center py-10">
              <Activity className="h-8 w-8 animate-spin text-secondary-500" />
            </div>
          ) : (
            <ActivityLog activities={activities || []} />
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Button variant="secondary" size="sm" onClick={handleOpenAddTask}>
              Add Task
            </Button>
          </div>
          {tasksLoading ? (
            <div className="flex justify-center py-10">
              <Activity className="h-8 w-8 animate-spin text-secondary-500" />
            </div>
          ) : (
            <TaskList 
              tasks={tasks || []} 
              onComplete={handleTaskComplete} 
              onDelete={handleTaskDelete}
            />
          )}
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter task description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Mark as completed</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="YYYY-MM-DD (e.g., 2025-06-28)"
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Dashboard;
