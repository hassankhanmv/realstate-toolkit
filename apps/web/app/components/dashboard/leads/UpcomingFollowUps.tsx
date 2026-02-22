import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarClock } from "lucide-react";

interface UpcomingLead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  follow_up_date: string;
  status: string;
  properties?: { title: string } | null;
}

export function UpcomingFollowUps() {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<UpcomingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetch("/api/leads/upcoming?days=7")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setLeads(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || leads.length === 0) return null;

  const getDueLabel = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diff < 0)
      return {
        label: t("leads.upcoming.overdue"),
        color: "text-red-600 bg-red-50",
      };
    if (diff === 0)
      return {
        label: t("leads.upcoming.due_today"),
        color: "text-amber-600 bg-amber-50",
      };
    return {
      label: t("leads.upcoming.due_in_days", { count: diff }),
      color: "text-blue-600 bg-blue-50",
    };
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center gap-2.5">
          <CalendarClock className="h-4.5 w-4.5 text-accent" />
          <div>
            <CardTitle className="text-sm font-semibold">
              {t("leads.upcoming.title")}
            </CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              {t("leads.upcoming.subtitle")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="space-y-2">
          {leads.slice(0, 5).map((lead) => {
            const due = getDueLabel(lead.follow_up_date);
            return (
              <div
                key={lead.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    {(lead as any).properties?.title && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {(lead as any).properties.title}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] ${due.color}`}
                >
                  {due.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
