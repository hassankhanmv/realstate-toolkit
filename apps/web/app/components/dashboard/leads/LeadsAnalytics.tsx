import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Building2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SOURCE_COLORS = [
  "#c9a96e",
  "#6e9cc9",
  "#9c6ec9",
  "#6ec99a",
  "#c96e6e",
  "#c9c06e",
];
const STATUS_COLORS = {
  New: "#3b82f6",
  Contacted: "#f59e0b",
  Viewing: "#8b5cf6",
  Negotiation: "#06b6d4",
  Won: "#22c55e",
  Lost: "#ef4444",
};

interface AnalyticsData {
  total: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  conversionRate: number;
  topProperties: { title: string; count: number }[];
}

export function LeadsAnalytics() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads/analytics")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data || data.total === 0) return null;

  const sourceData = Object.entries(data.bySource).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(data.byStatus).map(([name, value]) => ({
    name: t(`leads.status.${name}`, name),
    value,
    fill: (STATUS_COLORS as any)[name] || "#94a3b8",
  }));

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="analytics"
      className="w-full"
    >
      <AccordionItem
        value="analytics"
        className="border rounded-xl bg-card shadow-sm"
      >
        <AccordionTrigger className="px-5 py-4 hover:no-underline">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="h-4.5 w-4.5 text-accent" />
            <span className="font-semibold text-sm">
              {t("leads.analytics.title")}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pie: Leads by Source */}
            <Card className="border-border/50 shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("leads.analytics.by_source")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sourceData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar: Leads by Status */}
            <Card className="border-border/50 shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("leads.analytics.by_status")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={statusData} barSize={20}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Rate + Top Properties */}
            <Card className="border-border/50 shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("leads.analytics.conversion_rate")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                {/* Conversion */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-50 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.conversionRate}%</p>
                    <p className="text-[11px] text-muted-foreground">
                      {data.byStatus["Won"] || 0} {t("leads.analytics.won")} /{" "}
                      {data.total} {t("leads.analytics.total")}
                    </p>
                  </div>
                </div>

                {/* Top Properties */}
                {data.topProperties.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {t("leads.analytics.top_properties")}
                    </p>
                    <div className="space-y-1.5">
                      {data.topProperties.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{p.title}</span>
                          </div>
                          <span className="font-semibold text-accent shrink-0 ms-2">
                            {p.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
