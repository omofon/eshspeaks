import { NextResponse } from "next/server";
import { marketSeed } from "@/lib/data/market";
import type { MarketTicker } from "@/lib/data/types";

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
