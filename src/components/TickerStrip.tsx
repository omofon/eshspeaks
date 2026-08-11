"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatValue, jitter, marketSeed } from "@/lib/data/market";
import type { MarketTicker } from "@/lib/data/types";

export function useLiveMarket(seed: MarketTicker[], intervalMs = 3000) {
  const [items, setItems] = useState<MarketTicker[]>(seed);
  useEffect(() => {
    const id = window.setInterval(() => {
      setItems((prev) => prev.map(jitter));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return items;
}

export function TickerStrip({ items }: { items?: MarketTicker[] }) {
  const live = useLiveMarket(items ?? marketSeed.slice(0, 4));
  return (
    <div className="border-t border-navy-soft bg-navy">
      <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 py-2">
        {live.map((item) => (
          <div key={item.label} className="flex shrink-0 items-center gap-2 font-mono text-xs">
            <span className="text-background/70">{item.label}</span>
            <span className="text-background tabular-nums">{formatValue(item)}</span>
            <span
              className={`inline-flex items-center gap-0.5 tabular-nums ${
                item.direction === "up" ? "text-up" : "text-down"
              }`}
            >
              {item.direction === "up" ? (
                <ArrowUp className="h-3 w-3" strokeWidth={2} />
              ) : (
                <ArrowDown className="h-3 w-3" strokeWidth={2} />
              )}
              {Math.abs(item.changePct).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
