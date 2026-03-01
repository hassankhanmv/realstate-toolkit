import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export function PortalFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#302B25] text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#C4903D]/20 flex items-center justify-center">
                <span className="text-[#C4903D] font-bold text-xs tracking-wider">
                  RE
                </span>
              </div>
              <span className="text-[16px] font-semibold text-white tracking-tight">
                {t("portal.footer.brand", "Properties")}
              </span>
            </div>
            <p className="text-[13px] text-white/50 leading-relaxed">
              {t(
                "portal.footer.tagline",
                "Find your perfect property in the UAE. Browse, save, and inquire on premium listings.",
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[12px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">
              {t("portal.footer.quick_links", "Quick Links")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/portal"
                  className="text-[13px] text-white/60 hover:text-[#C4903D] transition-colors"
                >
                  {t("portal.nav.home", "Home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/portal/search"
                  className="text-[13px] text-white/60 hover:text-[#C4903D] transition-colors"
                >
                  {t("portal.nav.browse", "Browse Properties")}
                </Link>
              </li>
              <li>
                <Link
                  to="/portal/favorites"
                  className="text-[13px] text-white/60 hover:text-[#C4903D] transition-colors"
                >
                  {t("portal.nav.favorites", "Saved Properties")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-[12px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">
              {t("portal.footer.property_types", "Property Types")}
            </h3>
            <ul className="space-y-2">
              {["Apartment", "Villa", "Townhouse", "Office", "Commercial"].map(
                (type) => (
                  <li key={type}>
                    <Link
                      to={`/portal/search?type=${type}`}
                      className="text-[13px] text-white/60 hover:text-[#C4903D] transition-colors"
                    >
                      {t(`portal.property_types.${type.toLowerCase()}`, type)}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[12px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">
              {t("portal.footer.contact", "Contact")}
            </h3>
            <ul className="space-y-2 text-[13px] text-white/60">
              <li>{t("portal.footer.email", "info@realestate.ae")}</li>
              <li>{t("portal.footer.phone", "+971 4 000 0000")}</li>
              <li>{t("portal.footer.address", "Dubai, UAE")}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/30">
            © {new Date().getFullYear()}{" "}
            {t(
              "portal.footer.copyright",
              "Real Estate Toolkit. All rights reserved.",
            )}
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/about"
              className="text-[12px] text-white/30 hover:text-[#C4903D] transition-colors"
            >
              {t("portal.footer.about", "About")}
            </Link>
            <span className="text-[12px] text-white/10">|</span>
            <Link
              to="/about"
              className="text-[12px] text-white/30 hover:text-[#C4903D] transition-colors"
            >
              {t("portal.footer.privacy", "Privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
