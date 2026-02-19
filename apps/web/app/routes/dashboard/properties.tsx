import { useState } from "react";
import type { Route } from "./+types/properties";
import { data, useRevalidator } from "react-router";
import { useTranslation } from "react-i18next";
import { getSupabaseServer } from "@/lib/supabase.server";
import { getPropertiesByBroker, type Property } from "@repo/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GlobalDataTable,
  type HeaderConfig,
} from "~/components/global/table/GlobalDataTable";
import type { ContextMenuOption } from "~/components/global/table/ContextMenu";
import {
  Plus,
  Building2,
  FileText,
  CheckCircle2,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PropertyForm } from "@/components/properties/PropertyForm";
import type { PropertyFormValues } from "@/validations/property";
import { toast } from "sonner";
import { DashboardLayout } from "~/components/layouts/DashboardLayout";

// ── Loader ──────────────────────────────────────────────────────────────────

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data(
      { error: "Unauthorized", properties: [] as Property[] },
      { status: 401, headers },
    );
  }

  try {
    const properties = await getPropertiesByBroker(supabase, user.id);
    return data({ properties: properties ?? [], error: null }, { headers });
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return data(
      { properties: [] as Property[], error: "Failed to fetch" },
      { status: 500, headers },
    );
  }
};

export const action = async (_args: Route.ActionArgs) => null;

// ── Helpers ──────────────────────────────────────────────────────────────────

// Elegant, theme-compliant badges (White, Gray, Slate, Gold)
function getStatusStyles(status: string) {
  switch (status) {
    case "For Sale":
      return "border-accent text-accent bg-accent/10"; // Gold
    case "For Rent":
      return "border-primary text-primary bg-primary/5"; // Slate
    case "Off-Plan":
      return "border-muted-foreground text-muted-foreground bg-muted/50"; // Gray
    default:
      return "border-border text-foreground bg-background";
  }
}

function toFormValues(p: Property): Partial<PropertyFormValues> {
  return {
    title: p.title,
    price: p.price,
    location: p.location,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    furnished: p.furnished,
    description: p.description ?? "",
    type: p.type,
    status: p.status,
    is_published: p.is_published,
    notes: p.notes ?? "",
  };
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: any;
}) {
  return (
    <Card className="border-border shadow-sm transition-all hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-start">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </p>
          <p className="text-3xl font-light tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PropertiesPage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { properties } = loaderData;
  const revalidator = useRevalidator();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalProperties = properties.length;
  const publishedProperties = properties.filter(
    (p: Property) => p.is_published,
  ).length;
  const draftProperties = totalProperties - publishedProperties;

  function openCreate() {
    setSelectedProperty(null);
    setIsDialogOpen(true);
  }

  function openEdit(property: Property) {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setSelectedProperty(null);
  }

  const handleCreate = async (values: PropertyFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to create property");
      toast.success(t("properties.success.created"));
      closeDialog();
      revalidator.revalidate();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("properties.errors.create_failed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (values: PropertyFormValues) => {
    if (!selectedProperty) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to update property");
      toast.success(t("properties.success.updated"));
      closeDialog();
      revalidator.revalidate();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("properties.errors.update_failed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("properties.delete_confirm_desc"))) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete property");
      toast.success(t("properties.success.deleted"));
      revalidator.revalidate();
    } catch {
      toast.error(t("properties.errors.delete_failed"));
    }
  };

  const headers: HeaderConfig<Property>[] = [
    {
      accessorKey: "title",
      text: "properties.fields.title",
      cell: (row) => (
        <span className="font-semibold text-foreground">{row.title}</span>
      ),
    },
    {
      type: "action",
      text: "",
      align: "end", // Logical RTL support
      menuSide: "bottom", // Pass exact position to context menu
      menuAlign: "end",
    },
    {
      accessorKey: "location",
      text: "properties.fields.location",
      cell: (row) => (
        <span className="text-muted-foreground">{row.location}</span>
      ),
    },
    {
      accessorKey: "type",
      text: "properties.fields.type",
      cell: (row) => (
        <span className="font-medium text-foreground">
          {t(`properties.types.${row.type}`)}
        </span>
      ),
    },
    {
      accessorKey: "price",
      text: "properties.fields.price",
      cell: (row) => (
        <span className="font-medium tabular-nums text-foreground">
          AED {formatNumber(row.price)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      text: "properties.fields.status",
      cell: (row) => (
        <Badge
          variant="outline"
          className={`px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles(row.status)}`}
        >
          {t(`properties.statuses.${row.status}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "is_published",
      text: "properties.fields.is_published",
      cell: (row) => (
        <Badge
          variant={row.is_published ? "default" : "secondary"}
          className="px-2.5 py-0.5 text-xs font-semibold"
        >
          {row.is_published ? t("properties.published") : t("properties.draft")}
        </Badge>
      ),
    },
  ];

  const contextMenuOptions = (property: Property): ContextMenuOption[] => [
    {
      id: 1,
      title: "properties.edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => openEdit(property),
    },
    {
      id: 2,
      title: "properties.delete",
      icon: <Trash2 className="h-4 w-4" />,
      destructive: true,
      separator: true,
      onClick: () => handleDelete(property.id),
    },
  ];

  const massContextMenu: ContextMenuOption[] = [
    {
      id: 1,
      title: "common.table.refresh",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: () => revalidator.revalidate(),
    },
    {
      id: 2,
      title: "common.table.add_new",
      icon: <Plus className="h-4 w-4" />,
      onClick: openCreate,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Clean, Non-inline Stats Section */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title={t("dashboard.stats.total_properties")}
            value={totalProperties}
            icon={Building2}
          />
          <StatCard
            title={t("properties.published")}
            value={publishedProperties}
            icon={CheckCircle2}
          />
          <StatCard
            title={t("properties.draft")}
            value={draftProperties}
            icon={FileText}
          />
        </div>

        <GlobalDataTable
          headers={headers}
          data={properties}
          search={true}
          contextMenuOptions={contextMenuOptions}
          massContextMenu={massContextMenu}
          noDataIcon={Building2}
          noDataMessage="properties.no_properties"
          noDataDesc="properties.no_properties_desc"
        />
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-[580px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedProperty
                ? t("properties.edit")
                : t("properties.add_new")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("properties.subtitle")}
            </DialogDescription>
          </DialogHeader>
          <PropertyForm
            key={selectedProperty?.id ?? "new"}
            defaultValues={
              selectedProperty ? toFormValues(selectedProperty) : undefined
            }
            onSubmit={selectedProperty ? handleUpdate : handleCreate}
            isLoading={isSubmitting}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
