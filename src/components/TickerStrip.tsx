"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatValue, jitter, marketSeed } from "@/lib/data/market";
import type { MarketTicker } from "@/lib/data/types";

const DRIFT_MS = 4000; // local movement so the strip never looks dead
const POLL_MS = 30_000; // real feed poll, when /api/markets exists

/**
 * Live market data.
 * Tries /api/markets first; falls back to the local jitter walk.
 */
export function useLiveMarket(seed: MarketTicker[], driftMs = DRIFT_MS) {
  const [items, setItems] = useState<MarketTicker[]>(seed);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const hasFeed = useRef(false);

  // local drift
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!hasFeed.current) setItems((prev) => prev.map(jitter));
    }, driftMs);
    return () => window.clearInterval(id);
  }, [driftMs]);

  // real feed
  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const res = await fetch("/api/markets", { cache: "no-store" });
        if (!res.ok) throw new Error("no feed");
        const data = (await res.json()) as MarketTicker[];
        if (alive && Array.isArray(data) && data.length) {
          hasFeed.current = true;
          setItems(data);
        }
      } catch {
        /* keep drifting */
      } finally {
        if (alive) {
          setUpdatedAt(
            new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
          );
        }
      }
    }
    poll();
    const id = window.setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return { items, updatedAt, live: hasFeed.current };
}

function Quote({ item }: { item: MarketTicker }) {
  const up = item.direction === "up";
  return (
    <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-5">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-inverse/60">
        {item.label}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-text-inverse">
        {formatValue(item)}
      </span>
      <span
        className={`inline-flex items-center gap-0.5 font-mono text-[11px] tabular-nums ${
          up ? "text-up" : "text-down"
        }`}
      >
        {up ? (
          <ArrowUp className="h-3 w-3" strokeWidth={2} aria-hidden />
        ) : (
          <ArrowDown className="h-3 w-3" strokeWidth={2} aria-hidden />
        )}
        {Math.abs(item.changePct).toFixed(2)}%
      </span>
    </span>
  );
}

/**
 * Navy market strip, NYT-style: fixed "Markets" rail on the left,
 * continuously scrolling quotes on the right (paused on hover).
 * Pass `scroll={false}` for a static, wrapping strip.
 */
export function TickerStrip({
  items,
  scroll = true,
}: {
  items?: MarketTicker[];
  scroll?: boolean;
}) {
  const { items: live, updatedAt } = useLiveMarket(items ?? marketSeed);
  const loop = [...live, ...live];

  return (
    <div className="border-y border-text-inverse/15 bg-navy-deep text-text-inverse">
      <div className="container-eshspeaks flex items-center gap-4 py-1.5">
        <span className="hidden shrink-0 items-center gap-2 border-r border-text-inverse/20 pr-4 md:inline-flex">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Markets
          </span>
          {updatedAt && (
            <span className="font-mono text-[10px] text-text-inverse/45">· {updatedAt}</span>
          )}
        </span>

        {scroll ? (
          <div className="group relative min-w-0 flex-1 overflow-hidden" aria-live="off">
            <div className="animate-ticker flex w-max group-hover:[animation-play-state:paused] motion-reduce:animate-none">
              {loop.map((item, i) => (
                <Quote key={`${item.label}-${i}`} item={item} />
              ))}
            </div>
            {/* edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-navy-deep to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-navy-deep to-transparent" />
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {live.map((item) => (
              <Quote key={item.label} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TickerStrip;
