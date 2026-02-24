import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  description = "",
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
}) {
  return (
    <Card className="border-border shadow-sm transition-all hover:shadow-md bg-card">
      <CardContent className="flex flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary/80 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {title}
          </p>
        </div>
        <p className="text-xl font-bold tracking-tight text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
