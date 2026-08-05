import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { TierProvider } from "../lib/tier";
import { reportClientError } from "../lib/error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="bg-navy px-4 py-4">
        <Link to="/" className="mx-auto block max-w-6xl font-serif text-2xl text-background">
          EshSpeaks
        </Link>
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-24">
        <p className="font-mono text-xs tracking-widest text-accent">Error 404</p>
        <h1 className="mt-3 max-w-2xl font-serif text-5xl leading-tight text-navy">
          This page has been spiked
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          The story you were looking for is not here. It may have been moved, renamed, or never
          filed. Start from the front page or search the archive.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-navy"
          >
            Go to the front page
          </Link>
          <Link
            to="/search"
            className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-navy hover:border-navy"
          >
            Search the archive
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EshSpeaks — Nigerian politics, business and security" },
      {
        name: "description",
        content:
          "Reporting on Nigerian politics, business, economy and security, with premium investigations and The Seat.",
      },
      { name: "author", content: "EshSpeaks Media" },
      { property: "og:site_name", content: "EshSpeaks" },
      { property: "og:title", content: "EshSpeaks — Nigerian politics, business and security" },
      {
        property: "og:description",
        content: "Independent reporting from Abuja, Lagos and beyond.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@EshSpeaks" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Newsreader:wght@400;600&family=Inter:wght@400;600&family=IBM+Plex+Mono:wght@400;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <TierProvider>
        <Outlet />
      </TierProvider>
    </QueryClientProvider>
  );
}
