import { Task } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

const getPriorityBadgeClasses = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-error/20 text-error";
    case "medium":
      return "bg-warning/20 text-warning";
    case "low":
      return "bg-primary-100 text-primary-600";
    default:
      return "bg-primary-100 text-primary-600";
  }
};

export function TaskList({ tasks, onComplete, onDelete }: TaskListProps) {
  const formatDueDate = (dueDate: Date | null) => {
    if (!dueDate) return "No due date";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      return "Due today";
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return "Due tomorrow";
    } else {
      const diffTime = Math.abs(taskDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (taskDate < today) {
        return `Overdue by ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
      } else {
        return `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
      }
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className={cn(
            "flex items-center p-3 bg-gray-50 rounded-md",
            task.completed && "opacity-60"
          )}
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) => onComplete(task.id, checked as boolean)}
            className="h-4 w-4 mr-3 text-secondary-500"
          />
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              task.completed && "line-through"
            )}>
              {task.title}
            </p>
            <p className="text-xs text-gray-500">
              {task.dueDate ? formatDueDate(new Date(task.dueDate)) : "No due date"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-1 text-xs rounded-full",
              getPriorityBadgeClasses(task.priority || "Medium")
            )}>
              {task.priority || "Medium"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
