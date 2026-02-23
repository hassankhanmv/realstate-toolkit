import type { Route } from "./+types/dashboard";
import { getSupabaseServer } from "@/lib/supabase.server";
import { data, useNavigation } from "react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Tile } from "@/components/dashboard/Tile";
import {
  Building2,
  Contact,
  TrendingUp,
  Users,
  Plus,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setUser } from "~/store/slices/authSlice";
import { setLoading } from "~/store/slices/uiSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data(null, { status: 302, headers: { Location: "/login" } });
  }

  return data({ user }, { headers });
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Dashboard | Real Estate Toolkit" },
    {
      name: "description",
      content: "Dashboard - View and manage your properties, leads, and users.",
    },
  ];
};

/**
 * Dashboard Route - Optimized with useMemo
 *
 * Stats, quickActions, and activities arrays are memoized
 * to prevent Tile component re-renders on every navigation.
 */
export default function Dashboard({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return null;
  const { user } = loaderData;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  // Set user in redux store (in useEffect to avoid setting state during render)
  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  // Memoize stats array - only recompute when language changes
  const stats = useMemo(
    () => [
      {
        title: t("dashboard.stats.total_properties"),
        value: "12",
        trend: {
          value: t("dashboard.stats.properties_change", { count: 2 }),
          direction: "up" as const,
        },
        icon: Building2,
      },
      {
        title: t("dashboard.stats.active_leads"),
        value: "24",
        trend: {
          value: t("dashboard.stats.leads_change", { count: 8 }),
          direction: "up" as const,
        },
        icon: Contact,
      },
      {
        title: t("dashboard.stats.total_revenue"),
        value: "AED 2.4M",
        trend: {
          value: t("dashboard.stats.revenue_change", { percent: 12 }),
          direction: "up" as const,
        },
        icon: TrendingUp,
      },
      {
        title: t("dashboard.stats.active_users"),
        value: "8",
        trend: {
          value: t("dashboard.stats.users_online", { count: 2 }),
          direction: "up" as const,
        },
        icon: Users,
      },
    ],
    [t],
  );

  // Memoize quick actions - only recompute when language changes
  const quickActions = useMemo(
    () => [
      {
        title: t("dashboard.quick_actions.add_property"),
        description: t("dashboard.quick_actions.add_property_desc"),
        icon: Plus,
        href: "/dashboard/properties/new",
      },
      {
        title: t("dashboard.quick_actions.new_lead"),
        description: t("dashboard.quick_actions.new_lead_desc"),
        icon: UserPlus,
        href: "/dashboard/leads/new",
      },
      {
        title: t("dashboard.quick_actions.manage_users"),
        description: t("dashboard.quick_actions.manage_users_desc"),
        icon: Users,
        href: "/dashboard/users",
      },
    ],
    [t],
  );

  // Memoize activities - only recompute when language changes
  const activities = useMemo(
    () => [
      {
        action: t("dashboard.activity.property_listed"),
        time: t("dashboard.activity.time_hours_ago", { count: 2 }),
      },
      {
        action: t("dashboard.activity.lead_converted"),
        time: t("dashboard.activity.time_hours_ago", { count: 5 }),
      },
      {
        action: t("dashboard.activity.property_sold"),
        time: t("dashboard.activity.time_days_ago", { count: 1 }),
      },
    ],
    [t],
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid - Using Tile Component */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Tile
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {t("dashboard.quick_actions.title", "Quick Actions")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-slate-200"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <action.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t("dashboard.activity.title")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.activity.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0"
                >
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-accent flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
