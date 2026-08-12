// Drop at: app/api/markets/route.ts
// Returns MarketTicker[] — same shape the strip renders.
// Swap the mock block for your real provider call.

import { NextResponse } from "next/server";
import { marketSeed } from "@/lib/data/market";
import type { MarketTicker } from "@/lib/data/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // --- Replace this block with your provider ---
    // const res = await fetch(`https://provider.example/quotes?key=${process.env.MARKETS_API_KEY}`, { cache: "no-store" });
    // const raw = await res.json();
    // const data: MarketTicker[] = raw.map(mapProviderQuote);
    const data: MarketTicker[] = marketSeed.map((q) => {
      const changePct = q.changePct + (Math.random() - 0.5) * 0.2;
      return {
        ...q,
        value: q.value * (1 + changePct / 5000),
        changePct,
        direction: changePct >= 0 ? "up" : "down",
      };
    });
    // --------------------------------------------

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
