import { type ReactNode, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalNavbar } from "../portal/PortalNavbar";
import { PortalFooter } from "../portal/PortalFooter";
import { ScrollToTop } from "../common/ScrollToTop";
import "../../portal-theme.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface PortalLayoutProps {
  children: ReactNode;
  user?: {
    id: string;
    profile?: {
      full_name: string | null;
      avatar_url: string | null;
      role: string | null;
    };
  } | null;
  isPreview?: boolean;
}

export function PortalLayout({
  children,
  user,
  isPreview = false,
}: PortalLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="portal-theme min-h-screen flex flex-col bg-background text-foreground">
        {/* Preview banner for brokers */}
        {isPreview && (
          <div className="bg-amber-500 text-white text-center text-sm py-2 px-4 font-medium">
            Preview Mode — You are viewing the portal as a buyer would see it
          </div>
        )}

        {/* Navbar */}
        <PortalNavbar user={user} />

        {/* Main content */}
        <main className="flex-1 portal-main">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-[#C4903D] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>

        {/* Footer */}
        <PortalFooter />

        {/* Scroll to top */}
        <ScrollToTop />
      </div>
    </QueryClientProvider>
  );
}
