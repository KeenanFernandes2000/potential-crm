import { Activity } from "@shared/schema";
import { format } from "date-fns";
import { Mail, CheckCircle, Users, Calendar, FileText } from "lucide-react";

interface ActivityLogProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "email":
      return <Mail className="h-4 w-4 text-secondary-500" />;
    case "deal":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "contact":
      return <Users className="h-4 w-4 text-accent-500" />;
    case "meeting":
      return <Calendar className="h-4 w-4 text-warning" />;
    case "form":
      return <FileText className="h-4 w-4 text-primary-500" />;
    default:
      return <Mail className="h-4 w-4 text-secondary-500" />;
  }
};

const getActivityIconBackground = (type: string) => {
  switch (type) {
    case "email":
      return "bg-secondary-100";
    case "deal":
      return "bg-success/20";
    case "contact":
      return "bg-accent-100";
    case "meeting":
      return "bg-warning/20";
    case "form":
      return "bg-primary-100";
    default:
      return "bg-secondary-100";
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return diffInDays === 1 
      ? "Yesterday at " + format(date, "h:mm a")
      : format(date, "MMM d") + " at " + format(date, "h:mm a");
  } else if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  } else {
    return "Just now";
  }
};

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <div className={`h-8 w-8 rounded-full ${getActivityIconBackground(activity.type)} flex items-center justify-center mr-3`}>
            {getActivityIcon(activity.type)}
          </div>
          <div>
            <p className="text-sm">{activity.title}</p>
            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(new Date(activity.createdAt))}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
