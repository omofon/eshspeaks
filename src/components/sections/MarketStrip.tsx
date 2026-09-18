"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useLiveMarket } from "@/components/TickerStrip";
import { formatValue, marketSeed } from "@/lib/data/market";

/** Money Moves' scrolling market rail, powered by the same live/drifting
 *  feed as the old navy TickerStrip (see useLiveMarket) — just restyled to
 *  the Colouresh dark strip instead of the retired navy header. */
export function MarketStrip() {
  const { items } = useLiveMarket(marketSeed);
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y-2 border-ink bg-ink py-3">
      <div className="container-colouresh">
        <div className="flex w-max animate-ticker gap-9 whitespace-nowrap [animation-duration:22s]">
          {loop.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="flex items-center gap-2 text-[13px] font-bold text-white"
            >
              {item.label}
              <span className="text-white/70">{formatValue(item)}</span>
              <span
                className={`inline-flex items-center gap-0.5 ${item.direction === "up" ? "text-green" : "text-red"}`}
              >
                {item.direction === "up" ? (
                  <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
                ) : (
                  <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
                )}
                {Math.abs(item.changePct).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
