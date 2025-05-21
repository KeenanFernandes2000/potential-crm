import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";

interface StatisticCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatisticCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-secondary-500",
  iconBgColor = "bg-secondary-100",
}: StatisticCardProps) {
  const showChange = change !== undefined;
  const isPositive = showChange && change > 0;
  const isNegative = showChange && change < 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-semibold">{value}</h3>
          {showChange && (
            <p 
              className={cn(
                "text-xs mt-1 flex items-center",
                isPositive && "text-success",
                isNegative && "text-error"
              )}
            >
              {isPositive ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(change)}% from last month</span>
            </p>
          )}
        </div>
        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}
