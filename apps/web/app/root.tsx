import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useTranslation } from "react-i18next";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

import { Provider } from "react-redux";
import { store } from "./store/store";
import { GlobalSpinner } from "./components/global/GlobalSpinner";
import { GlobalToaster } from "./components/global/GlobalToaster";
import { I18nLoader } from "./components/global/I18nLoader";
import { initializeGlobalApp } from "./lib/common";
import { useEffect } from "react";
import { useRouteLoaderData } from "react-router";

import "./lib/i18n";
import { registerDevTools } from "./lib/devTools";
import { Button } from "./components/ui/button";
import { AlertTriangle, FileQuestion, Home, RefreshCw } from "lucide-react";

function AppInit() {
  useEffect(() => {
    initializeGlobalApp(store);
    if (import.meta.env.DEV) {
      registerDevTools();
    }
  }, []);
  return null;
}

export async function loader() {
  return {
    ENV: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData("root") as {
    ENV: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  };
  const { i18n } = useTranslation();
  return (
    <html lang={i18n.language} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="antialiased">
        <Provider store={store}>
          <I18nLoader>{children}</I18nLoader>
          <GlobalSpinner />
          <GlobalToaster />
          <AppInit />
        </Provider>
        {/* expose ENV to browser */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data?.ENV ?? {})}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
// ── Upgraded Premium Error Boundary ─────────────────────────────────────────

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  let title = "System Error";
  let message = "An unexpected error occurred while processing your request.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "Page Not Found" : `Error ${error.status}`;
    message =
      error.status === 404
        ? "The page you are looking for doesn't exist or has been moved."
        : error.statusText || message;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    message = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        {/* Dynamic Icon */}
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ${is404 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}
        >
          {is404 ? (
            <FileQuestion className="h-10 w-10" />
          ) : (
            <AlertTriangle className="h-10 w-10" />
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {is404 ? "404" : "Oops!"}{" "}
            {title !== "Page Not Found" && title !== "System Error"
              ? ""
              : title}
          </h1>
          <p className="text-muted-foreground text-lg">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Button
            asChild
            className="h-11 px-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/dashboard">
              <Home className="me-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-11 px-8 font-semibold"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="me-2 h-4 w-4" />
            Try Again
          </Button>
        </div>

        {/* Developer Stack Trace (Only visible in DEV environment) */}
        {stack && (
          <div className="mt-8 w-full text-start">
            <p className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Developer Stack Trace
            </p>
            <div className="w-full rounded-lg bg-muted/50 border border-border/50 p-4 overflow-x-auto max-h-[300px] overflow-y-auto">
              <pre className="text-xs font-mono text-foreground/80 leading-relaxed">
                <code>{stack}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
