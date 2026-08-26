"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Single client-side cache for data shared across many independent
 * consumers (header, footer, mobile drawer, admin forms, ...). Without
 * this, every mounted consumer ran its own fetch — e.g. sections were
 * fetched once each by SectionNavigation and MobileNavigationDrawer,
 * doubled again by React StrictMode in dev — which is what tripped the
 * backend's rate limiter on a single homepage load. React Query dedupes
 * concurrent requests for the same key and serves cached data to every
 * consumer until it goes stale, so N components asking for the same data
 * now cost one network call, not N.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 30 * 60_000,
            retry: (failureCount, error) => {
              const kind = (error as { kind?: string } | null)?.kind;
              if (kind === "rate_limited" || kind === "unauthorized" || kind === "forbidden") {
                return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
