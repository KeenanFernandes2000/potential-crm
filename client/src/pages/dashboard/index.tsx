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

  const handleTaskComplete = (id: number, completed: boolean) => {
    updateTaskMutation.mutate({ id, completed });
  };

  // Pipeline stages data
  const pipelineStages: PipelineStage[] = [
    { name: "New Leads", count: 42, percentage: 32 },
    { name: "Qualified", count: 28, percentage: 21 },
    { name: "Proposal", count: 19, percentage: 14 },
    { name: "Negotiation", count: 12, percentage: 9, isLast: true },
    { name: "Closed Won", count: 32, percentage: 24, isWon: true },
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
          <Button variant="secondary" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatisticCard
          title="Total Leads"
          value={statsLoading ? "Loading..." : stats?.totalLeads || "1,482"}
          change={12.5}
          icon={Users}
          iconColor="text-secondary-500"
          iconBgColor="bg-secondary-100"
        />
        <StatisticCard
          title="Open Deals"
          value={statsLoading ? "Loading..." : stats?.openDeals || "64"}
          change={3.2}
          icon={DollarSign}
          iconColor="text-accent-500"
          iconBgColor="bg-accent-100"
        />
        <StatisticCard
          title="Revenue"
          value={statsLoading ? "Loading..." : stats?.revenue || "$89,421"}
          change={-4.1}
          icon={DollarSign}
          iconColor="text-success"
          iconBgColor="bg-success/20"
        />
        <StatisticCard
          title="Conversion Rate"
          value={statsLoading ? "Loading..." : stats?.conversionRate || "24.8%"}
          change={1.8}
          icon={BarChart3}
          iconColor="text-primary-500"
          iconBgColor="bg-primary-100"
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
            <Button variant="secondary" size="sm">
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
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
