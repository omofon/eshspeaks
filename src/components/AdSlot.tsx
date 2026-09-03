"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchAdSlot, isAdsUnavailable, type AdPlacement } from "@/lib/api/ads";

/**
 * One ad slot. Give it a `placement` and, where the page knows them,
 * `section` (slug) and `sector` (an article's first sectorTag) for
 * targeting. Behaviour:
 *
 *  - Premium readers: renders nothing, and never calls the endpoint.
 *  - Endpoint missing (404) or no fill: nothing in production; a labelled
 *    placeholder box in dev so the layout stays visible during build-out.
 *  - Fill: the creative, inside a fixed-height frame (no layout shift) with
 *    a small "Advertisement" label, per newspaper convention.
 *
 * The fetch is client-side on purpose: subscriber suppression is
 * client-only, and an ad call must never block or vary the page's SSR.
 */

type Props = {
  placement: AdPlacement;
  section?: string | undefined;
  sector?: string | undefined;
  className?: string;
};

const FRAME_HEIGHT: Record<AdPlacement, string> = {
  leaderboard: "h-[90px] md:h-[90px]",
  "in-feed": "h-[250px]",
  sidebar: "h-[600px]",
  "sponsored-segment": "h-[120px]",
};

const SHOW_PLACEHOLDER = process.env.NODE_ENV !== "production";

function AdFrame({
  placement,
  className,
  sponsor,
  children,
}: {
  placement: AdPlacement;
  className?: string | undefined;
  sponsor?: string | null | undefined;
  children?: React.ReactNode;
}) {
  return (
    <aside
      aria-label="Advertisement"
      className={`w-full ${className ?? ""}`}
      data-ad-placement={placement}
    >
      <p className="meta mb-1 text-center text-[9px] tracking-[0.2em]">
        {sponsor ? `Sponsored · ${sponsor}` : "Advertisement"}
      </p>
      <div
        className={`flex w-full items-center justify-center overflow-hidden rounded-sm border border-dashed border-rule bg-muted ${FRAME_HEIGHT[placement]}`}
      >
        {children}
      </div>
    </aside>
  );
}

export function AdSlot({ placement, section, sector, className }: Props) {
  const { isSubscriber, status } = useAuth();

  const { data, error, isLoading } = useQuery({
    queryKey: ["ad-slot", placement, section ?? null, sector ?? null],
    queryFn: () => fetchAdSlot({ placement, section, sector }),
    enabled: status !== "loading" && !isSubscriber,
    staleTime: 60_000,
    retry: false,
  });

  // Premium readers never see ads.
  if (isSubscriber) return null;

  const noFill = isAdsUnavailable(error) || (!isLoading && !data?.creative);

  if (noFill) {
    if (!SHOW_PLACEHOLDER) return null;
    return (
      <AdFrame placement={placement} className={className}>
        <span className="font-mono text-[11px] tracking-wide text-text-muted">
          {placement} · ad slot
        </span>
      </AdFrame>
    );
  }

  if (isLoading || !data?.creative) {
    // Reserve the space so the page doesn't jump when the creative lands.
    return <AdFrame placement={placement} className={className} />;
  }

  const { creative, sponsor } = data;

  return (
    <AdFrame placement={placement} className={className} sponsor={sponsor}>
      {creative.type === "image" ? (
        <a
          href={creative.clickUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block h-full w-full"
        >
          <img
            src={creative.imageUrl}
            alt={creative.alt}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </a>
      ) : (
        <iframe
          src={creative.src}
          title="Advertisement"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="h-full w-full border-0"
        />
      )}
    </AdFrame>
  );
}
