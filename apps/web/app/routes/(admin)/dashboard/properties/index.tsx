import { useState, useEffect } from "react";
import type { Route } from "./+types/index";
import { data, useNavigate, useNavigation, useRevalidator } from "react-router";
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
  Minimize2,
  Eye,
  ExternalLink,
  Users,
  Sparkles,
} from "lucide-react";
import {
  formatNumber,
  truncateText,
  formatDateShort,
  formatDateLong,
  formatTimeAgo,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      { error: "Unauthorized", properties: [] as Property[], user: null },
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

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Properties | Real Estate Toolkit" },
    {
      name: "description",
      content: "View and manage your properties.",
    },
  ];
};

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
    media: {
      urls: [],
      media_urls: p.images ?? [],
    },
    uae: {
      handover_date: p.handover_date ?? undefined,
      payment_plan: p.payment_plan ?? undefined,
      rera_id: p.rera_id ?? undefined,
      roi_estimate: p.roi_estimate ?? undefined,
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
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { properties, user } = loaderData;
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
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

  // Update your closeDialog function:
  function closeDialog() {
    setIsDialogOpen(false);
    setSelectedProperty(null);
    setIsMaximized(false); // Reset size on close
  }

  const handleCreate = async (values: PropertyFormValues) => {
    setIsSubmitting(true);
    const images = [
      ...(values.media?.media_urls ?? []),
      ...(values.media?.urls ?? []),
    ];
    const flatData = {
      ...values.basicInfo,
      ...values.specifications,
      ...values.publishing,
      images,
      handover_date: values.uae?.handover_date || null,
      payment_plan: values.uae?.payment_plan || null,
      rera_id: values.uae?.rera_id || null,
      roi_estimate: values.uae?.roi_estimate ?? null,
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
    const images = [
      ...(values.media?.media_urls ?? []),
      ...(values.media?.urls ?? []),
    ];
    const flatData = {
      ...values.basicInfo,
      ...values.specifications,
      ...values.publishing,
      images,
      handover_date: values.uae?.handover_date || null,
      payment_plan: values.uae?.payment_plan || null,
      rera_id: values.uae?.rera_id || null,
      roi_estimate: values.uae?.roi_estimate ?? null,
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

  const locale = i18n.language === "ar" ? "ar-SA" : "en-US";

  const headers: HeaderConfig<Property>[] = [
    {
      accessorKey: "title",
      text: "properties.fields.title",
      sortable: true,
      cell: (row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2.5 min-w-0">
                {row.images?.[0] ? (
                  <img
                    src={row.images[0]}
                    alt=""
                    className="h-8 w-8 rounded-md object-cover shrink-0 border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                <span className="text-xs text-foreground truncate">
                  {truncateText(row.title, 30)}
                </span>
              </div>
            </TooltipTrigger>
            {row.title.length > 30 && (
              <TooltipContent side="bottom">
                <p className="text-xs max-w-[280px]">{row.title}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      type: "action",
      text: "",
      align: "end",
      menuSide: "bottom",
      menuAlign: "end",
    },
    {
      accessorKey: "location",
      text: "properties.fields.location",
      sortable: true,
      cell: (row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground truncate block max-w-[140px]">
                {truncateText(row.location, 20)}
              </span>
            </TooltipTrigger>
            {row.location.length > 20 && (
              <TooltipContent side="bottom">
                <p className="text-xs">{row.location}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "type",
      text: "properties.fields.type",
      sortable: true,
      filter: {
        dataType: [
          { label: t("properties.types.Apartment"), value: "Apartment" },
          { label: t("properties.types.Villa"), value: "Villa" },
          { label: t("properties.types.Townhouse"), value: "Townhouse" },
          { label: t("properties.types.Office"), value: "Office" },
          { label: t("properties.types.Plot"), value: "Plot" },
          { label: t("properties.types.Commercial"), value: "Commercial" },
        ],
        type: "select",
      },
      cell: (row) => (
        <span className="text-xs text-foreground">
          {t(`properties.types.${row.type}`)}
        </span>
      ),
    },
    {
      accessorKey: "price",
      text: "properties.fields.price",
      sortable: true,
      filter: {
        dataType: "number",
        type: "field",
      },
      cell: (row) => (
        <span className="text-xs tabular-nums text-foreground">
          AED {formatNumber(row.price)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      text: "properties.fields.status",
      sortable: true,
      filter: {
        dataType: [
          { label: t("properties.statuses.For Sale"), value: "For Sale" },
          { label: t("properties.statuses.For Rent"), value: "For Rent" },
          { label: t("properties.statuses.Off-Plan"), value: "Off-Plan" },
          { label: t("properties.statuses.Ready"), value: "Ready" },
        ],
        type: "select",
      },
      cell: (row) => (
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0 font-medium leading-5 ${getStatusStyles(row.status)}`}
        >
          {t(`properties.statuses.${row.status}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "is_published",
      text: "properties.fields.is_published",
      sortable: true,
      filter: {
        dataType: [
          { label: t("properties.published"), value: "true" },
          { label: t("properties.draft"), value: "false" },
        ],
        type: "select",
      },
      cell: (row) => (
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0 font-medium leading-5 gap-1.5 ${
            row.is_published
              ? "border-green-500/40 text-green-600 bg-green-500/5"
              : "border-amber-500/40 text-amber-600 bg-amber-500/5"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              row.is_published ? "bg-green-500" : "bg-amber-500"
            }`}
          />
          {row.is_published ? t("properties.published") : t("properties.draft")}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      text: "properties.fields.created_at",
      sortable: true,
      cell: (row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimeAgo(row.created_at, locale)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                {formatDateLong(row.created_at, locale)}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
      title: "properties.view_leads",
      icon: <Users className="h-4 w-4" />,
      onClick: () => {
        navigate(`/dashboard/leads?propertyId=${property.id}`);
      },
    },
    {
      id: 5,
      title: "properties.ai_description",
      icon: <Sparkles className="h-4 w-4" />,
      onClick: () => {
        toast.info(t("properties.coming_soon"));
      },
    },
    {
      id: 6,
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
      <>
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
            // noDataDesc="properties.no_properties_desc"
          />
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          {/* Dynamic classes for width/height based on isMaximized state */}
          <DialogContent
            className={`p-0 bg-card border-border shadow-xl rounded-xl sm:rounded-2xl transition-all duration-300 flex flex-col ${
              isMaximized
                ? "w-[95vw] max-w-none h-[95vh]"
                : "sm:max-w-[750px] w-[95vw] h-[85vh] sm:h-[90vh] max-h-[90vh]"
            }`}
          >
            <div className="absolute right-12 top-3 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-6 w-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle Size</span>
              </Button>

              {selectedProperty && (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
                  title="Open full detail page"
                >
                  <Link to={`/dashboard/properties/${selectedProperty.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open full detail page</span>
                  </Link>
                </Button>
              )}
            </div>

            <DialogHeader className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 shrink-0">
              <div className="space-y-1.5 text-start">
                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                  {selectedProperty
                    ? t("properties.edit")
                    : t("properties.add_new")}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  {t("properties.subtitle")}
                </DialogDescription>
              </div>
            </DialogHeader>

            {/* Added overflow-y-auto so the form scrolls perfectly when height is maxed */}
            <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-2 overflow-y-auto flex-1">
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
      </>
    </DashboardLayout>
  );
}
