import { useState, useEffect } from "react";
import type { Route } from "./+types/index";
import { data, useNavigate, useRevalidator } from "react-router";
import { useTranslation } from "react-i18next";
import { getSupabaseServer } from "@/lib/supabase.server";
import { getPropertiesByBroker, type Property } from "@repo/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
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
  Loader2,
  Maximize2,
  Eye,
  ExternalLink,
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
import { Button } from "~/components/ui/button";
import { useAppDispatch } from "~/store/hooks";
import { setLoading, addToast } from "~/store/slices/uiSlice";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { setUser } from "~/store/slices/authSlice";

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
    return data(
      { properties: properties ?? [], error: null, user },
      { headers },
    );
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return data(
      { properties: [] as Property[], error: "Failed to fetch", user },
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

function toFormValues(p: Property): PropertyFormValues {
  return {
    basicInfo: {
      title: p.title,
      price: p.price,
      location: p.location,
      type: p.type as any,
      status: p.status as any,
    },
    specifications: {
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      furnished: p.furnished,
    },
    publishing: {
      description: p.description ?? "",
      is_published: p.is_published,
      notes: p.notes ?? "",
    },
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
    <Card className="border-border shadow-sm transition-all hover:shadow-md bg-card">
      <CardContent className="flex flex-row items-center justify-between gap-4 p-4">
        {/* Left Side: Icon and Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary/80 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {title}
          </p>
        </div>

        {/* Right Side: Value */}
        <p className="text-xl font-bold tracking-tight text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PropertiesPage({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { properties, user } = loaderData;
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalProperties = properties.length;
  const publishedProperties = properties.filter(
    (p: Property) => p.is_published,
  ).length;
  const draftProperties = totalProperties - publishedProperties;

  // Set user in redux store (in useEffect to avoid setting state during render)
  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

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
    const flatData = {
      ...values.basicInfo,
      ...values.specifications,
      ...values.publishing,
    };
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flatData),
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
    const flatData = {
      ...values.basicInfo,
      ...values.specifications,
      ...values.publishing,
    };
    try {
      const res = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flatData),
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

  const confirmDelete = async () => {
    if (!deleteId) return;

    dispatch(setLoading(true)); // Trigger global Redux loader
    try {
      const res = await fetch(`/api/properties/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete property");

      dispatch(
        addToast({ message: t("properties.success.deleted"), type: "success" }),
      );
      revalidator.revalidate();
    } catch {
      dispatch(
        addToast({
          message: t("properties.errors.delete_failed"),
          type: "error",
        }),
      );
    } finally {
      dispatch(setLoading(false)); // Turn off global loader
      setDeleteId(null); // Close dialog
    }
  };

  const headers: HeaderConfig<Property>[] = [
    {
      accessorKey: "title",
      text: "properties.fields.title",
      sortable: true,
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
      sortable: true,
      cell: (row) => (
        <span className="text-muted-foreground">{row.location}</span>
      ),
    },
    {
      accessorKey: "type",
      text: "properties.fields.type",
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-foreground">
          {t(`properties.types.${row.type}`)}
        </span>
      ),
    },
    {
      accessorKey: "price",
      text: "properties.fields.price",
      sortable: true,
      cell: (row) => (
        <span className="font-medium tabular-nums text-foreground">
          AED {formatNumber(row.price)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      text: "properties.fields.status",
      sortable: true,
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
      sortable: true,
      tooltip: "properties.published_tooltip",
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
      title: "properties.view",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => openView(property),
    },
    {
      id: 3,
      title: "properties.open_detail",
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: () => openDetail(property),
    },
    {
      id: 4,
      title: "properties.delete",
      icon: <Trash2 className="h-4 w-4" />,
      destructive: true,
      separator: true,
      onClick: () => setDeleteId(property.id),
    },
  ];

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
      onClick: openCreate,
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

  const openDetail = (property: Property) => {
    navigate(`/dashboard/properties/${property.id}`);
  };

  const openView = (property: Property) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Clean, Non-inline Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-2">
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
          title={t("properties.title")}
          description={t("properties.subtitle")}
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
        <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-card border-border shadow-xl">
          {/* Custom Expand Icon next to the default Close 'X' */}
          {selectedProperty && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="absolute right-11 top-3 h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              title="Open full detail page"
            >
              <Link to={`/dashboard/properties/${selectedProperty.id}`}>
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Expand</span>
              </Link>
            </Button>
          )}

          <DialogHeader className="px-8 pt-8 pb-4">
            <div className="space-y-1.5 text-start">
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                {selectedProperty
                  ? t("properties.edit")
                  : t("properties.add_new")}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {t("properties.subtitle")}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Increased horizontal padding to match the wider dialog */}
          <div className="px-8 pb-8 pt-2">
            <PropertyForm
              defaultValues={
                selectedProperty ? toFormValues(selectedProperty) : undefined
              }
              onSubmit={selectedProperty ? handleUpdate : handleCreate}
              isLoading={isSubmitting}
              onCancel={closeDialog}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("properties.delete_confirm_title")}
        description={t("properties.delete_confirm_desc")}
        confirmText={t("properties.delete")}
        variant="destructive"
      />
    </DashboardLayout>
  );
}
