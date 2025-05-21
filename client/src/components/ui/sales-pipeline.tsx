import { cn } from "@/lib/utils";

export interface PipelineStage {
  name: string;
  count: number;
  percentage: number;
  isLast?: boolean;
  isWon?: boolean;
}

interface SalesPipelineProps {
  stages: PipelineStage[];
  className?: string;
}

export function SalesPipeline({ stages, className }: SalesPipelineProps) {
  return (
    <div className={cn("flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4", className)}>
      {stages.map((stage, index) => (
        <div 
          key={stage.name}
          className={cn(
            "relative flex-1 p-4 rounded-md border",
            stage.isWon 
              ? "bg-success/20 border-success/30" 
              : "bg-primary-50 border-primary-100 pipeline-arrow"
          )}
        >
          <h3 className="text-sm font-semibold mb-2">{stage.name}</h3>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">{stage.count}</span>
            <span 
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                stage.isWon 
                  ? "bg-success/30 text-success" 
                  : "bg-primary-100 text-primary-700"
              )}
            >
              {stage.percentage}%
            </span>
          </div>
          
          {!stage.isLast && !stage.isWon && (
            <div className="hidden md:block absolute right-[-10px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[10px] border-r-0 border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-[#e2e8f0] z-10" />
          )}
        </div>
      ))}
    </div>
  );
}
