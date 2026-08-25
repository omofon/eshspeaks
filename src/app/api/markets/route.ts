import { NextResponse } from "next/server";
import { marketSeed } from "@/lib/data/market";
import type { MarketTicker } from "@/lib/data/types";

/**
 * Mock-only by design: src/components/TickerStrip.tsx already tries this
 * route first and falls back to a local jitter walk if it 404s, so nothing
 * broke while this file was missing — but restoring it is still correct.
 * It's not obsolete: it's the deliberate interim source for the ticker
 * until a real feed exists. The TRD's planned backend endpoint
 * (GET /ticker/ngx) is explicitly flagged there as an unresolved "Sprint 5
 * risk" (market data vendor undecided), so this mock stays the right
 * source for now — swap the body for a real feed once that vendor and
 * endpoint are confirmed.
 */
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data: MarketTicker[] = marketSeed.map((quote) => {
      const changePct = quote.changePct + (Math.random() - 0.5) * 0.2;
      return {
        ...quote,
        value: quote.value * (1 + changePct / 5000),
        changePct,
        direction: changePct >= 0 ? "up" : "down",
      };
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
