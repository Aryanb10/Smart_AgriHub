import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <span className="text-2xl font-bold text-foreground font-display">{value}</span>
        {trend && (
          <span className={cn("ml-2 text-xs font-medium", trendUp ? "text-green-600" : "text-red-500")}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
