import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { data, useRevalidator, type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigation, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { getSupabaseServer } from "@/lib/supabase.server";
import {
  getLeadsByBroker,
  getPropertiesByBroker,
  type Lead,
} from "@repo/supabase";
import Papa from "papaparse";
import {
  Loader2,
  Plus,
  RefreshCw,
  Building2,
  Users,
  CheckCircle2,
  MessageCircle,
  Mail,
  Phone,
  Download,
  Trash2,
  CheckSquare,
  Eye,
} from "lucide-react";

import { LeadForm } from "@/components/dashboard/leads/LeadForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NameCell,
  ContactCell,
  PropertyLinkCell,
  StatusBadgeCell,
  DateCell,
} from "@/components/global/table/CellRenderers";
import {
  GlobalDataTable,
  type HeaderConfig,
} from "@/components/global/table/GlobalDataTable";
import type { ContextMenuOption } from "@/components/global/table/ContextMenu";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "~/components/layouts/DashboardLayout";
import { setUser } from "~/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { setLoading } from "~/store/slices/uiSlice";
import { toast } from "sonner";

import { LeadsAnalytics } from "@/components/dashboard/leads/LeadsAnalytics";
import { UpcomingFollowUps } from "@/components/dashboard/leads/UpcomingFollowUps";
import { WhatsAppTemplateButton } from "@/components/dashboard/leads/WhatsAppTemplates";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Route } from "./+types";
import StatCard from "~/components/global/StatCard";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized", leads: [] }, { status: 401, headers });
  }

  try {
    const url = new URL(request.url);
    const propertyId = url.searchParams.get("propertyId");

    let leads = [];
    const allLeads = await getLeadsByBroker(supabase, user.id);

    if (propertyId) {
      leads = allLeads.filter((lead) => lead.property_id === propertyId);
    } else {
      leads = allLeads;
    }

    const allProperties = await getPropertiesByBroker(supabase, user.id);
    const properties = allProperties.map((p: any) => ({
      id: p.id,
      title: p.title,
    }));

    return data({ leads, user, propertyId, properties }, { headers });
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return data(
      { error: "Failed to fetch leads", leads: [], user: null, properties: [] },
      { status: 500, headers },
    );
  }
}

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Leads | Real Estate Toolkit" },
    {
      name: "description",
      content: "View and manage your leads.",
    },
  ];
};


export default function LeadsPage() {
  const { leads, error, user, propertyId, properties } = useLoaderData<
    typeof loader
  >() as {
    leads: any[];
    error?: string;
    user: any;
    propertyId: string | null;
    properties: Array<{ id: string; title: string }>;
  };
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const revalidator = useRevalidator();

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);
  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

  // State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  // Counter to force column rebuild when selection changes
  const [selectionVersion, setSelectionVersion] = useState(0);
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  const handleOpenForm = (lead?: Lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };
  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setSelectedLead(undefined);
  };

  const totalLeads = leads?.length || 0;
  const openLeads =
    leads?.filter((l) => !["Won", "Lost"].includes(l.status)).length || 0;
  const closedWon = leads?.filter((l) => l.status === "Won").length || 0;

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectionVersion((v) => v + 1);
  }, []);
  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
    setSelectionVersion((v) => v + 1);
  };
  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionVersion((v) => v + 1);
  };

  // Bulk status change
  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const res = await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          data: { status },
        }),
      });
      if (res.ok) {
        toast.success(
          t("leads.bulk.status_updated", { count: selectedIds.size }),
        );
        clearSelection();
        revalidator.revalidate();
      }
    } catch (err) {
      toast.error(t("leads.errors.update_failed"));
    } finally {
      setBulkUpdating(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        toast.success(t("leads.bulk.deleted", { count: selectedIds.size }));
        clearSelection();
        revalidator.revalidate();
      }
    } catch (err) {
      toast.error(t("leads.errors.delete_failed"));
    } finally {
      setBulkUpdating(false);
      setBulkDeleteOpen(false);
    }
  };

  // Single lead delete
  const handleSingleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [deleteId] }),
      });
      if (res.ok) {
        toast.success(t("leads.success.deleted"));
        revalidator.revalidate();
      }
    } catch (err) {
      toast.error(t("leads.errors.delete_failed"));
    } finally {
      setDeleteId(null);
    }
  };

  // CSV export
  const handleExport = (onlySelected: boolean) => {
    const rows = onlySelected
      ? leads.filter((l) => selectedIds.has(l.id))
      : leads;

    const csvData = rows.map((l) => ({
      Name: l.name,
      Phone: l.phone || "",
      Email: l.email || "",
      Status: l.status,
      Source: l.source || "",
      Property: (l as any).properties?.title || "",
      "Follow-Up": l.follow_up_date || "",
      Notes: l.notes || "",
      Created: l.created_at,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("leads.export.exported"));
  };

  // Action options per row
  const getActionOptions = useCallback((lead: any): ContextMenuOption[] => {
    const options: ContextMenuOption[] = [
      {
        id: 1,
        title: "leads.actions.view",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => handleOpenForm(lead),
      },
    ];

    if (lead.phone) {
      options.push({
        id: 2,
        title: "leads.actions.whatsapp",
        onClick: () =>
          window.open(
            `https://wa.me/${lead.phone!.replace(/[^0-9]/g, "")}`,
            "_blank",
          ),
        icon: <MessageCircle className="h-4 w-4" />,
      });
      options.push({
        id: 3,
        title: "leads.actions.call",
        onClick: () => window.open(`tel:${lead.phone}`),
        icon: <Phone className="h-4 w-4" />,
      });
    }

    if (lead.email) {
      options.push({
        id: 4,
        title: "leads.actions.email",
        onClick: () => window.open(`mailto:${lead.email}`),
        icon: <Mail className="h-4 w-4" />,
      });
    }

    // Delete option (destructive, at the end)
    options.push({
      id: 10,
      title: "leads.actions.delete",
      icon: <Trash2 className="h-4 w-4" />,
      destructive: true,
      separator: true,
      onClick: () => setDeleteId(lead.id),
    });

    return options;
  }, []);

  const columns: HeaderConfig<Lead>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        text: t("leads.fields.name", "Name"),
        cell: (row) => (
          <div className="flex items-center gap-2.5">
            <Checkbox
              checked={selectedIdsRef.current.has(row.id)}
              onCheckedChange={() => toggleSelect(row.id)}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 cursor-pointer"
            />
            <NameCell name={row.name} />
          </div>
        ),
        sortable: true,
      },
      {
        type: "action",
        text: "",
        align: "end",
        menuSide: "bottom",
        menuAlign: "end",
      },
      {
        accessorKey: "property_id",
        text: t("leads.fields.property", "Property"),
        cell: (row) => (
          <PropertyLinkCell
            propertyId={row.property_id}
            title={(row as any).properties?.title}
          />
        ),
      },
      {
        accessorKey: "status",
        text: t("leads.fields.status", "Status"),
        sortable: true,
        cell: (row) => (
          <StatusBadgeCell
            status={row.status as string}
            label={t(`leads.status.${row.status}`, row.status as string)}
          />
        ),
        filter: {
          type: "select",
          dataType: [
            { label: t("leads.status.New", "New"), value: "New" },
            {
              label: t("leads.status.Contacted", "Contacted"),
              value: "Contacted",
            },
            { label: t("leads.status.Viewing", "Viewing"), value: "Viewing" },
            {
              label: t("leads.status.Negotiation", "Negotiation"),
              value: "Negotiation",
            },
            { label: t("leads.status.Won", "Won"), value: "Won" },
            { label: t("leads.status.Lost", "Lost"), value: "Lost" },
          ],
        },
      },
      {
        accessorKey: "source",
        text: t("leads.fields.source", "Source"),
        sortable: true,
        cell: (row) => {
          const source = row.source;
          return source ? t(`leads.source.${source}`, source) : "-";
        },
        filter: {
          type: "select",
          dataType: [
            {
              label: t("leads.source.WhatsApp", "WhatsApp"),
              value: "WhatsApp",
            },
            { label: t("leads.source.Website", "Website"), value: "Website" },
            {
              label: t("leads.source.Referral", "Referral"),
              value: "Referral",
            },
            { label: t("leads.source.Other", "Other"), value: "Other" },
          ],
        },
      },
      {
        accessorKey: "phone",
        text: t("leads.fields.phone", "Contact"),
        cell: (row) => (
          <div className="flex items-center gap-1">
            {/* Phone + Email icons only (no duplicate WhatsApp) */}
            {row.phone && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${row.phone}`, "_self");
                }}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {row.email && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${row.email}`, "_self");
                }}
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
            {/* WhatsApp template button (single green icon) */}
            {row.phone && (
              <WhatsAppTemplateButton
                phone={row.phone}
                name={row.name}
                propertyTitle={(row as any).properties?.title}
              />
            )}
          </div>
        ),
      },
      {
        accessorKey: "follow_up_date",
        text: t("leads.fields.follow_up", "Follow-Up Date"),
        sortable: true,
        cell: (row) =>
          row.follow_up_date ? (
            <DateCell
              date={row.follow_up_date}
              locale={i18n.language === "ar" ? "ar-AE" : "en-US"}
            />
          ) : (
            <span className="text-muted-foreground italic">-</span>
          ),
        filter: {
          type: "date-range",
          dataType: "string", // not strictly used for date-range but required by type
        },
      },
      {
        accessorKey: "created_at",
        text: t("leads.fields.created_at", "Date"),
        sortable: true,
        cell: (row) => (
          <DateCell
            date={row.created_at}
            locale={i18n.language === "ar" ? "ar-AE" : "en-US"}
          />
        ),
        filter: {
          type: "date-range",
          dataType: "string",
        },
      },
    ],
    [t, i18n, selectionVersion],
  );

  const massContextMenu: ContextMenuOption[] = [
    {
      id: 1,
      title: "common.table.refresh",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: () => refreshList(),
    },
    {
      id: 2,
      title: "common.table.add_new",
      icon: <Plus className="h-4 w-4" />,
      onClick: handleOpenForm,
    },
    {
      id: 3,
      title: "leads.export.export_csv",
      icon: <Download className="h-4 w-4" />,
      onClick: () => handleExport(false),
      separator: true,
    },
  ];

  useEffect(() => {
    if (revalidator.state === "loading") {
      dispatch(setLoading(true));
    } else {
      dispatch(setLoading(false));
    }
  }, [revalidator.state, dispatch]);

  const refreshList = () => {
    revalidator.revalidate();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6" dir={i18n.dir()}>
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-2">
          <StatCard
            title={t("leads.cards.total_leads")}
            value={totalLeads}
            icon={Users}
          />
          <StatCard
            title={t("leads.cards.open_leads")}
            value={openLeads}
            icon={MessageCircle}
          />
          <StatCard
            title={t("leads.cards.closed_won")}
            value={closedWon}
            icon={CheckCircle2}
          />
        </div>

        {/* Analytics (collapsible) — hide when viewing property-specific leads */}
        {!propertyId && <LeadsAnalytics />}

        {/* Upcoming Follow-Ups */}
        <UpcomingFollowUps />

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-accent/5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">
                {t("leads.bulk.selected_count", { count: selectedIds.size })}
              </span>
            </div>

            <div className="flex items-center gap-2 ms-auto">
              {/* Bulk status change */}
              <Select
                onValueChange={handleBulkStatusChange}
                disabled={bulkUpdating}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder={t("leads.bulk.change_status")} />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "New",
                    "Contacted",
                    "Viewing",
                    "Negotiation",
                    "Won",
                    "Lost",
                  ].map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="text-xs cursor-pointer"
                    >
                      {t(`leads.status.${s}`, s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Export selected */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => handleExport(true)}
              >
                <Download className="h-3.5 w-3.5" />
                {t("leads.bulk.export_selected")}
              </Button>

              {/* Delete selected */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={bulkUpdating}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("leads.bulk.delete_selected")}
              </Button>

              {/* Clear selection */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={clearSelection}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-4">
          <GlobalDataTable
            headers={columns}
            title={t("leads.title")}
            description={t("leads.subtitle")}
            data={leads as any[]}
            search={true}
            contextMenuOptions={getActionOptions}
            massContextMenu={massContextMenu}
            noDataIcon={Building2}
            noDataMessage="leads.no_leads"
            noDataDesc="leads.no_leads_desc"
            noDataAction={
              <Button onClick={() => handleOpenForm()}>
                <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t("common.table.add_new", "Add New")}
              </Button>
            }
          />
        </div>

        <LeadForm
          open={isFormOpen}
          onOpenChange={handleCloseForm}
          lead={selectedLead}
          defaultPropertyId={propertyId || undefined}
          properties={properties}
        />

        {/* Bulk delete confirm */}
        <ConfirmDialog
          isOpen={bulkDeleteOpen}
          onClose={() => setBulkDeleteOpen(false)}
          title={t("leads.bulk.confirm_delete_title", {
            count: selectedIds.size,
          })}
          description={t("leads.bulk.confirm_delete_desc", {
            count: selectedIds.size,
          })}
          onConfirm={handleBulkDelete}
        />

        {/* Single lead delete confirm */}
        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title={t("leads.delete_confirm_title")}
          description={t("leads.delete_confirm_desc")}
          onConfirm={handleSingleDelete}
        />
      </div>
    </DashboardLayout>
  );
}
