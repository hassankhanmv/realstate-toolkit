import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Search,
  Heart,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Home,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { cn } from "@/lib/utils";

interface PortalNavbarProps {
  user?: {
    id: string;
    profile?: {
      full_name: string | null;
      avatar_url: string | null;
      role: string | null;
    };
  } | null;
}

export function PortalNavbar({ user }: PortalNavbarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/portal";
    } catch {
      window.location.href = "/portal";
    }
  }, []);

  const navLinks = useMemo(
    () => [
      { href: "/portal", label: t("portal.nav.home", "Home") },
      {
        href: "/portal/search",
        label: t("portal.nav.browse", "Browse Properties"),
      },
    ],
    [t],
  );

  const isActive = (href: string) => {
    if (href === "/portal") return pathname === "/portal";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop/Tablet Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[56px]">
            {/* Logo */}
            <Link to="/portal" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded bg-[#302B25] flex items-center justify-center">
                <span className="text-[#C4903D] font-bold text-xs tracking-wider">
                  RE
                </span>
              </div>
              <span className="text-[15px] font-semibold text-foreground hidden sm:block tracking-tight">
                {t("portal.nav.brand", "Properties")}
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-3 py-2 text-[13px] font-medium rounded transition-colors cursor-pointer",
                    isActive(link.href)
                      ? "text-[#C4903D]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              <LanguageSwitcher />

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hidden sm:flex cursor-pointer hover:bg-secondary/80 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onClick={() => navigate("/portal/favorites")}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 gap-1.5 hidden sm:flex cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-secondary/80"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#302B25] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#C4903D]">
                            {user.profile?.full_name
                              ?.substring(0, 2)
                              .toUpperCase() || "U"}
                          </span>
                        </div>
                        <span className="text-[13px] font-medium max-w-24 truncate">
                          {user.profile?.full_name ||
                            t("portal.nav.account", "Account")}
                        </span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white">
                      <DropdownMenuItem
                        onClick={() => navigate("/portal/profile")}
                        className="cursor-pointer"
                      >
                        <User className="h-4 w-4 me-2" />
                        {t("portal.nav.profile", "My Profile")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/portal/favorites")}
                        className="cursor-pointer"
                      >
                        <Heart className="h-4 w-4 me-2" />
                        {t("portal.nav.favorites", "Saved Properties")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 me-2" />
                        {t("portal.nav.logout", "Log Out")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 hidden sm:flex cursor-pointer bg-[#302B25] hover:bg-[#3d352c] text-white"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-4 w-4 me-1.5" />
                  {t("portal.nav.login", "Sign In")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 start-0 end-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-border/50 pb-safe">
        <div className="flex items-center justify-around h-14 px-2">
          <Link
            to="/portal"
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer",
              isActive("/portal") && pathname === "/portal"
                ? "text-[#C4903D]"
                : "text-muted-foreground",
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">
              {t("portal.nav.home", "Home")}
            </span>
          </Link>

          <Link
            to="/portal/search"
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer",
              isActive("/portal/search")
                ? "text-[#C4903D]"
                : "text-muted-foreground",
            )}
          >
            <Compass className="h-5 w-5" />
            <span className="text-[10px] font-medium">
              {t("portal.nav.browse_short", "Browse")}
            </span>
          </Link>

          {user ? (
            <>
              <Link
                to="/portal/favorites"
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer",
                  isActive("/portal/favorites")
                    ? "text-[#C4903D]"
                    : "text-muted-foreground",
                )}
              >
                <Heart className="h-5 w-5" />
                <span className="text-[10px] font-medium">
                  {t("portal.nav.saved_short", "Saved")}
                </span>
              </Link>

              <Link
                to="/portal/profile"
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer",
                  isActive("/portal/profile")
                    ? "text-[#C4903D]"
                    : "text-muted-foreground",
                )}
              >
                <User className="h-5 w-5" />
                <span className="text-[10px] font-medium">
                  {t("portal.nav.profile_short", "Profile")}
                </span>
              </Link>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer text-muted-foreground"
            >
              <LogIn className="h-5 w-5" />
              <span className="text-[10px] font-medium">
                {t("portal.nav.login", "Sign In")}
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
