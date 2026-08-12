"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatValue, marketSeed } from "@/lib/data/market";
import { useLiveMarket } from "@/components/TickerStrip";
import { ListCard } from "@/components/ArticleCard";
import { bySubsegment } from "@/lib/data/articles";
import { ArrowDown, ArrowUp } from "lucide-react";

function Sparkline({ seed }: { seed: number }) {
  const points = useMemo(() => {
    let v = 50;
    return Array.from({ length: 24 }, (_, i) => {
      v += Math.sin(i * seed) * 6 + Math.cos(i * (seed + 1.7)) * 3;
      return `${(i / 23) * 100},${Math.max(4, Math.min(56, 60 - v / 2))}`;
    }).join(" ");
  }, [seed]);
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="mt-3 h-14 w-full">
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  );
}

export function MarketDashboard() {
  const { items: live } = useLiveMarket(marketSeed, 2500);
  const articles = bySubsegment("business-economy", "the-market");

  return (
    <div>
      <header className="border-b border-rule pb-6">
        <p className="font-mono text-xs tracking-widest text-accent">Business & economy</p>
        <h1 className="mt-2 font-serif text-4xl text-navy">The market</h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Live-style indicators, updated continuously. Figures on this page are mocked for
          demonstration.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((item, i) => (
          <div key={item.label} className="rounded-md border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-navy">{formatValue(item)}</p>
            <p
              className={`mt-1 inline-flex items-center gap-1 font-mono text-xs ${
                item.direction === "up" ? "text-up" : "text-down"
              }`}
            >
              {item.direction === "up" ? (
                <ArrowUp className="h-3 w-3" strokeWidth={2} />
              ) : (
                <ArrowDown className="h-3 w-3" strokeWidth={2} />
              )}
              {Math.abs(item.changePct).toFixed(2)}% today
            </p>
            <Sparkline seed={i + 1} />
          </div>
        ))}
      </div>

      <section className="rule-top mt-10 pt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-navy">Market coverage</h2>
          <Link href="/business-economy" className="text-sm text-accent hover:underline">
            All business & economy
          </Link>
        </div>
        <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
          {articles.map((a) => (
            <ListCard key={a.slug} a={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
