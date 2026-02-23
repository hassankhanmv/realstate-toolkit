import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "react-router";
import { Sidebar } from "../dashboard/Sidebar";
import { Header } from "../dashboard/Header";
import { MobileBottomNav } from "../dashboard/MobileBottomNav";
import { MobileNavDrawer } from "../dashboard/MobileNavDrawer";
import { localStorageManager } from "@/lib/localStorageManager";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create a media query to trigger only when crossing the 1024px breakpoint
    const mediaQuery = window.matchMedia("(max-width: 1024px)");

    const handleMediaQueryChange = (
      e: MediaQueryListEvent | MediaQueryList,
    ) => {
      if (e.matches) {
        // Less than 1024px: auto-collapse
        setSidebarCollapsed(true);
      } else {
        // Greater than 1024px: restore saved preference or default to false
        const currentSaved = localStorageManager.getItem<boolean | null>(
          "sidebar-collapsed",
          null,
        );
        setSidebarCollapsed(currentSaved !== null ? currentSaved : false);
      }
    };

    // Initial check on mount
    handleMediaQueryChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSidebarChange = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorageManager.setItem("sidebar-collapsed", collapsed);
  }, []);

  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    // Changed hardcoded bg-slate-50 to theme-compliant bg-background
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block sticky top-0 shrink-0 z-40 h-screen border-e border-border bg-card">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={handleSidebarChange}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-300">
        {/* Desktop Header */}
        <Header className="hidden md:flex bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30" />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav
          className="md:hidden"
          isMenuOpen={mobileMenuOpen}
          onMenuOpen={handleMobileMenuOpen}
        />

        {/* Mobile Nav Drawer */}
        <MobileNavDrawer
          open={mobileMenuOpen}
          onClose={handleMobileMenuClose}
          currentPath={location.pathname}
        />
      </div>
    </div>
  );
}
