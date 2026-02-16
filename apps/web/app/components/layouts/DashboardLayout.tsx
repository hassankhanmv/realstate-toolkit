import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "react-router";
import { Sidebar } from "../dashboard/Sidebar";
import { Header } from "../dashboard/Header";
import { MobileBottomNav } from "../dashboard/MobileBottomNav";
import { MobileNavDrawer } from "../dashboard/MobileNavDrawer";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout - Responsive layout component
 *
 * Desktop (≥768px): Sidebar + Header
 * Mobile (<768px): Bottom Nav + Drawer
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Load sidebar state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Memoize the collapse handler to prevent Sidebar re-renders
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden md:block fixed start-0 top-0 z-40 h-screen border-e border-slate-200">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={handleSidebarChange}
        />
      </aside>

      {/* Main Content Area */}
      <div
        className="flex flex-col w-full md:transition-all md:duration-300"
        style={{
          marginInlineStart: sidebarCollapsed ? "64px" : "288px",
        }}
      >
        {/* Desktop Header - hidden on mobile */}
        <Header className="hidden md:flex" />

        {/* Main Content - Extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">{children}</main>

        {/* Mobile Bottom Nav - hidden on desktop */}
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
