import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "react-router";
import { Sidebar } from "../dashboard/Sidebar";
import { Header } from "../dashboard/Header";
import { MobileBottomNav } from "../dashboard/MobileBottomNav";
import { MobileNavDrawer } from "../dashboard/MobileNavDrawer";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    }
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSidebarChange = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
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
      <aside className="hidden md:block fixed start-0 top-0 z-40 h-screen border-e border-border bg-card">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={handleSidebarChange}
        />
      </aside>

      {/* Main Content Area */}
      {/* FIX: Replaced inline styles with responsive Tailwind classes. 
          md:ms-16 = 64px on desktop only. md:ms-72 = 288px on desktop only. */}
      <div
        className={`flex flex-col w-full min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "md:ms-16" : "md:ms-72"
        }`}
      >
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