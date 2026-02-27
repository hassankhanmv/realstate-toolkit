import { useEffect, useState, useMemo, useCallback } from "react";
import type { Route } from "./+types/$id";
import {
  data,
  Link,
  useFetcher,
  useNavigate,
  useNavigation,
  useRevalidator,
} from "react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Property, getLeadsByProperty, type Lead } from "@repo/supabase";
import {
  propertySchema,
  type PropertyFormValues,
} from "@/validations/property";

import { PropertyBasicInfo } from "~/components/properties/PropertyBasicInfo";
import { PropertySpecs } from "~/components/properties/PropertySpecs";
import { PropertyPublishing } from "~/components/properties/PropertyPublishing";
import { PropertyMedia } from "~/components/properties/PropertyMedia";
import { DashboardLayout } from "~/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NameCell,
  ContactCell,
  StatusBadgeCell,
  DateCell,
} from "@/components/global/table/CellRenderers";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Globe,
  Home,
  Settings2,
  Users,
  RefreshCw,
  Plus,
  MessageCircle,
  Mail,
  Phone,
  ImagePlus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAppDispatch } from "~/store/hooks";
import { useSelector } from "react-redux";
import { setLoading, addToast } from "~/store/slices/uiSlice";
import {
  selectCanEditProperty,
  selectCanDeleteProperty,
  setUser,
} from "~/store/slices/authSlice";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  GlobalDataTable,
  type HeaderConfig,
} from "~/components/global/table/GlobalDataTable";
import type { ContextMenuOption } from "~/components/global/table/ContextMenu";
import { LeadForm } from "@/components/dashboard/leads/LeadForm";
import { requirePermission } from "~/lib/auth.server";

// ── Loader ──────────────────────────────────────────────────────────────────

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { supabase, headers, user } = await requirePermission(
    request,
    "properties",
    "view",
  ).catch((err) => {
    throw err;
  });

  if (!user) throw data({ error: "Unauthorized" }, { status: 401, headers });

  // Fetch the specific property
  const { data: propertyData, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id as string)
    .single();

  const property = propertyData as unknown as Property;

  if (error || !property) {
    throw data({ error: "Property not found" }, { status: 404, headers });
  }

  // Fetch leads for this property
  const leads = await getLeadsByProperty(supabase, property.id);

  // Map the flat DB data to our scalable, nested Zod structure
  const formData: PropertyFormValues = {
    basicInfo: {
      title: property.title,
      price: property.price,
      location: property.location,
      type: property.type as any,
      status: property.status as any,
    },
    specifications: {
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      furnished: property.furnished,
    },
    publishing: {
      description: property.description ?? "",
      is_published: property.is_published,
      notes: property.notes ?? "",
    },
    media: {
      urls: [],
      media_urls: property.images ?? [],
    },
  };

  return data({ property, formData, leads: leads as any[], user }, { headers });
};

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data || !data.property) {
    return [{ title: "Property Details | Real Estate Toolkit" }];
  }
  const { property } = data as any;
  return [
    { title: `${property.title} | Real Estate Toolkit` },
    {
      name: "description",
      content: `View details for ${data.property.title} located in ${data.property.location}.`,
    },
  ];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusStyles(status: string) {
  switch (status) {
    case "For Sale":
      return "border-accent text-accent bg-accent/10";
    case "For Rent":
      return "border-primary text-primary bg-primary/5";
    case "Off-Plan":
      return "border-muted-foreground text-muted-foreground bg-muted/50";
    default:
      return "border-border text-foreground bg-background";
  }
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function PropertyDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // For redirecting after delete
  const revalidator = useRevalidator();
  const { property, formData, leads, user } = loaderData as any;

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  const [activeSection, setActiveSection] = useState("basic-info");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Delete dialog state

  const canEdit = useSelector(selectCanEditProperty);
  const canDelete = useSelector(selectCanDeleteProperty);

  // Leads state
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: formData,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const onSubmit = async (values: PropertyFormValues) => {
    dispatch(setLoading(true));
    try {
      const images = [
        ...(values.media?.media_urls ?? []),
        ...(values.media?.urls ?? []),
      ];
      const flatData = {
        ...values.basicInfo,
        ...values.specifications,
        ...values.publishing,
        images,
      };

      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flatData),
      });

      if (!res.ok) throw new Error("Update failed");
      dispatch(
        addToast({ message: t("properties.success.updated"), type: "success" }),
      );
    } catch (err) {
      dispatch(
        addToast({
          message: t("properties.errors.update_failed"),
          type: "error",
        }),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async () => {
    dispatch(setLoading(true));
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      dispatch(
        addToast({ message: t("properties.success.deleted"), type: "success" }),
      );
      // Redirect back to the properties table
      navigate("/dashboard/properties");
    } catch (err) {
      dispatch(
        addToast({
          message: t("properties.errors.delete_failed"),
          type: "error",
        }),
      );
    } finally {
      dispatch(setLoading(false));
      setIsDeleteDialogOpen(false);
    }
  };

  const handleViewLive = () => {
    // Opens your public frontend listing page in a new tab
    // Adjust "/listing/" to whatever your public route actually is
    window.open(`/listing/${property.id}`, "_blank");
  };

  const handleOpenLeadForm = (lead?: Lead) => {
    setSelectedLead(lead);
    setIsLeadFormOpen(true);
  };

  const leadsColumns: HeaderConfig<any>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        text: t("leads.fields.name", "Name"),
        sortable: true,
        cell: (row) => <NameCell name={row.name} />,
      },
      {
        type: "action",
        text: "",
        align: "end",
        menuSide: "bottom",
        menuAlign: "end",
      },
      {
        accessorKey: "status",
        text: t("leads.fields.status", "Status"),
        sortable: true,
        cell: (row) => (
          <StatusBadgeCell
            status={row.status || "New"}
            label={
              t(
                `leads.status.${row.status || "New"}`,
                row.status || "New",
              ) as string
            }
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
        accessorKey: "phone",
        text: t("leads.fields.phone", "Contact"),
        cell: (row) => <ContactCell phone={row.phone} email={row.email} />,
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
      },
    ],
    [t, i18n],
  );

  const getActionOptions = useCallback(
    (row: any): ContextMenuOption[] => {
      if (!canEdit) return [];
      return [
        {
          id: 1,
          title: "properties.edit",
          icon: <Eye className="h-4 w-4" />,
          onClick: () => handleOpenLeadForm(row),
        },
        {
          id: 2,
          title: "leads.actions.whatsapp",
          icon: <MessageCircle className="h-4 w-4" />,
          onClick: () =>
            row.phone && window.open(`https://wa.me/${row.phone}`, "_blank"),
          disabled: !row.phone,
        },
        {
          id: 3,
          title: "leads.actions.call",
          icon: <Phone className="h-4 w-4" />,
          onClick: () => row.phone && window.open(`tel:${row.phone}`, "_self"),
          disabled: !row.phone,
        },
        {
          id: 4,
          title: "leads.actions.email",
          icon: <Mail className="h-4 w-4" />,
          onClick: () =>
            row.email && window.open(`mailto:${row.email}`, "_self"),
          disabled: !row.email,
        },
      ];
    },
    [canEdit],
  );

  const massContextMenu: ContextMenuOption[] = [
    {
      id: 1,
      title: "common.table.refresh",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: () => revalidator.revalidate(),
    },
    ...(canEdit
      ? [
          {
            id: 2,
            title: "common.table.add_new",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => handleOpenLeadForm(),
          },
        ]
      : []),
  ];

  // Sidebar navigation sections
  const sections = [
    { id: "basic-info", label: t("properties.basics"), icon: Home },
    { id: "specifications", label: t("properties.details"), icon: Settings2 },
    { id: "media", label: t("properties.media"), icon: ImagePlus },
    { id: "publishing", label: t("properties.publishing"), icon: Globe },
    { id: "leads", label: t("leads.title", "Leads"), icon: Users },
  ];

  return (
    <DashboardLayout>
      <Form {...(form as any)}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="flex flex-col gap-6 relative"
        >
          {/* ── Top Header (Sticky) ── */}
          <div className="sticky top-0 z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 border-b border-border/50 pt-2 -mx-6 px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-7 w-7 rounded-md"
                >
                  <Link to="/dashboard/properties">
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
                <span>{t("properties.title") || "Properties"}</span>
                <span>/</span>
                <span className="truncate max-w-[200px]">{property.title}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {property.title}
                </h1>
                <Badge
                  variant="outline"
                  className={`px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles(property.status)}`}
                >
                  {t(`properties.statuses.${property.status}`)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4 font-medium cursor-pointer"
                onClick={handleViewLive}
              >
                <Eye className="h-4 w-4 me-2" />
                {t("properties.view_live") || "View Live"}
              </Button>
              {canEdit && (
                <Button
                  type="submit"
                  className="h-9 px-6 font-semibold bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
                >
                  <Save className="h-4 w-4 me-2" />
                  {t("properties.save")}
                </Button>
              )}
            </div>
          </div>

          {/* ── Main Layout Grid ── */}
          <div
            className={`grid grid-cols-1 ${
              isSidebarOpen
                ? "md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]"
                : "md:grid-cols-[64px_1fr] lg:grid-cols-[64px_1fr]"
            } gap-4 items-start transition-all duration-300 ease-in-out`}
          >
            {/* Left Sidebar Navigation (Sticky) */}
            <nav className="hidden md:flex flex-col sticky top-32 gap-1 overflow-hidden bg-white rounded-lg p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mb-2 w-full self-start md:self-end text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </Button>

              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                const linkContent = (
                  <a
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    } ${!isSidebarOpen ? "justify-center" : "justify-start"}`}
                    title={!isSidebarOpen ? section.label : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                    />
                    {isSidebarOpen && (
                      <span className="truncate">{section.label}</span>
                    )}
                  </a>
                );

                return linkContent;
              })}
            </nav>

            {/* Right Side Content Areas */}
            <div
              className={`flex flex-col gap-8 pb-20 overflow-x-hidden ${!canEdit ? "pointer-events-none opacity-90 grayscale-[10%]" : ""}`}
            >
              <fieldset disabled={!canEdit} className="contents">
                {/* Section 1: Basic Info */}
                <Card
                  id="basic-info"
                  className="scroll-mt-32 border-border shadow-sm"
                >
                  <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
                    <CardTitle className="text-lg font-semibold">
                      {t("properties.basics")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <PropertyBasicInfo form={form as any} />
                  </CardContent>
                </Card>

                {/* Section 2: Specifications */}
                <Card
                  id="specifications"
                  className="scroll-mt-32 border-border shadow-sm"
                >
                  <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
                    <CardTitle className="text-lg font-semibold">
                      {t("properties.details")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <PropertySpecs form={form as any} />
                  </CardContent>
                </Card>

                {/* Section 3: Media */}
                <Card
                  id="media"
                  className="scroll-mt-32 border-border shadow-sm"
                >
                  <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
                    <CardTitle className="text-lg font-semibold">
                      {t("properties.media")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <PropertyMedia />
                  </CardContent>
                </Card>

                {/* Section 4: Publishing */}
                <Card
                  id="publishing"
                  className="scroll-mt-32 border-border shadow-sm"
                >
                  <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
                    <CardTitle className="text-lg font-semibold">
                      {t("properties.publishing")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <PropertyPublishing form={form as any} />
                  </CardContent>
                </Card>
              </fieldset>

              {/* Section 4: Leads */}
              <div className="pointer-events-auto filter-none opacity-100">
                <Card
                  id="leads"
                  className="scroll-mt-32 border-border shadow-sm !pointer-events-auto"
                >
                  <CardContent className="p-6">
                    <GlobalDataTable
                      headers={leadsColumns}
                      data={leads}
                      title={t("leads.title")}
                      search={true}
                      contextMenuOptions={getActionOptions}
                      massContextMenu={massContextMenu}
                      noDataIcon={Users}
                      noDataMessage="leads.no_leads"
                      noDataDesc="leads.no_leads_desc"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Danger Zone */}
              {canDelete && (
                <Card className="border-destructive/30 shadow-sm mt-8 pointer-events-auto opacity-100 filter-none">
                  <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        {t("properties.danger_zone") || "Danger Zone"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("properties.delete_desc") ||
                          "Permanently delete this property and all its associated data."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      className="shrink-0 font-semibold"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 me-2" />
                      {t("properties.delete")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
      </Form>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t("properties.delete_confirm_title")}
        description={t("properties.delete_confirm_desc")}
        confirmText={t("properties.delete")}
        variant="destructive"
      />

      <LeadForm
        open={isLeadFormOpen}
        onOpenChange={(open) => {
          setIsLeadFormOpen(open);
          if (!open) setSelectedLead(undefined);
        }}
        lead={selectedLead}
        defaultPropertyId={property.id}
      />
    </DashboardLayout>
  );
}
