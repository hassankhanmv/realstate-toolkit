import { data } from "react-router";
import type { Route } from "./+types/profile";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import { requireBuyerAuth } from "@/lib/auth.server";
import { getUserInquiries } from "@repo/supabase";
import { PortalLayout } from "@/components/layouts/PortalLayout";
import { User, Mail, Shield, Clock, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export const meta: Route.MetaFunction = () => [
  { title: "My Profile | Real Estate Portal" },
  { name: "description", content: "View and manage your profile." },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, supabase, headers, isPreview } =
    await requireBuyerAuth(request);

  let inquiries: any[] = [];
  if (user?.email) {
    try {
      inquiries = await getUserInquiries(supabase, user.email);
    } catch {
      // Non-critical
    }
  }

  return data({ user, isPreview, inquiries }, { headers });
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  const { user, isPreview, inquiries } = loaderData;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) dispatch(setUser(user));
  }, [user, dispatch]);

  const initials = user.profile?.full_name
    ? user.profile.full_name.substring(0, 2).toUpperCase()
    : "U";

  return (
    <PortalLayout user={user} isPreview={isPreview}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 md:pb-12">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C4903D] mb-2">
            {t("portal.profile.eyebrow", "Account")}
          </span>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t("portal.profile.title", "My Profile")}
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            {t("portal.profile.subtitle", "Your account information")}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-border/60 rounded-lg overflow-hidden">
          {/* Avatar header */}
          <div className="px-6 py-6 border-b border-border/40">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#302B25] flex items-center justify-center shrink-0">
                {user.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-[#C4903D]">
                    {initials}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {user.profile?.full_name ||
                    t("portal.profile.unnamed", "Unnamed User")}
                </h2>
                <span className="inline-block text-[11px] font-semibold tracking-wide uppercase text-[#C4903D] mt-0.5">
                  {user.profile?.role || "buyer"}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            {/* Email */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30">
              <Mail className="h-4 w-4 text-[#C4903D] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-muted-foreground uppercase tracking-wide font-medium">
                  {t("portal.profile.email", "Email")}
                </p>
                <p className="text-[14px] font-medium text-foreground truncate">
                  {user.email || "—"}
                </p>
              </div>
            </div>

            {/* Company */}
            {user.profile?.company_name && (
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30 bg-secondary/20">
                <Shield className="h-4 w-4 text-[#C4903D] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-muted-foreground uppercase tracking-wide font-medium">
                    {t("portal.profile.company", "Company")}
                  </p>
                  <p className="text-[14px] font-medium text-foreground truncate">
                    {user.profile.company_name}
                  </p>
                </div>
              </div>
            )}

            {/* Member since */}
            <div className="flex items-center gap-3 px-6 py-4">
              <Clock className="h-4 w-4 text-[#C4903D] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-muted-foreground uppercase tracking-wide font-medium">
                  {t("portal.profile.member_since", "Member Since")}
                </p>
                <p className="text-[14px] font-medium text-foreground">
                  {new Date(
                    user.profile?.created_at ?? user.created_at,
                  ).toLocaleDateString("en-AE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry History */}
        <div className="mt-6 bg-white border border-border/60 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-border/30">
            <h3 className="text-[16px] font-bold text-foreground tracking-tight">
              {t("portal.profile.inquiry_history", "Inquiry History")}
            </h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {t("portal.profile.inquiry_desc", "Your past property inquiries")}
            </p>
          </div>

          {inquiries.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto">
              {inquiries.map((inquiry: any, i: number) => (
                <div
                  key={inquiry.id}
                  className={`px-6 py-3 flex items-start gap-3 ${i < inquiries.length - 1 ? "border-b border-border/20" : ""} ${i % 2 === 0 ? "bg-secondary/10" : ""}`}
                >
                  <Building2 className="h-4 w-4 text-[#C4903D] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {inquiry.property_title ? (
                        <Link
                          to={`/portal/property/${inquiry.property_id}`}
                          className="text-[13px] font-medium text-foreground hover:text-[#C4903D] transition-colors truncate max-w-[220px]"
                        >
                          {inquiry.property_title}
                        </Link>
                      ) : (
                        <span className="text-[13px] font-medium text-foreground">
                          {t(
                            "portal.profile.property_inquiry",
                            "Property Inquiry",
                          )}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                          inquiry.status === "New"
                            ? "bg-[#C4903D]/10 text-[#C4903D]"
                            : inquiry.status === "Contacted"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                    {inquiry.message && (
                      <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
                        {inquiry.message}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {new Date(inquiry.created_at).toLocaleDateString(
                        "en-AE",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  {inquiry.property_id && (
                    <Link
                      to={`/portal/property/${inquiry.property_id}`}
                      className="text-[#C4903D] hover:text-[#a37730] transition-colors shrink-0 mt-1"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-6">
              <Mail className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-[14px] text-muted-foreground">
                {t(
                  "portal.profile.no_inquiries",
                  "No inquiries yet. Browse properties and send your first inquiry!",
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
