import type { MarketTicker } from "./types";

export const marketSeed: MarketTicker[] = [
  { label: "NGX all-share", value: 104238.44, direction: "up", changePct: 0.62 },
  { label: "USD/NGN", value: 1487.35, prefix: "₦", direction: "down", changePct: -0.41 },
  { label: "Brent crude", value: 78.92, prefix: "$", direction: "up", changePct: 1.14 },
  { label: "Inflation (y/y)", value: 24.8, unit: "%", direction: "down", changePct: -0.3 },
  { label: "MPR", value: 27.5, unit: "%", direction: "up", changePct: 0.0 },
  { label: "Ext. reserves", value: 38.4, prefix: "$", unit: "bn", direction: "up", changePct: 0.22 },
];

/** Deterministic-ish random walk used by the ticker components. */
export function jitter(item: MarketTicker): MarketTicker {
  const swing = (Math.random() - 0.48) * (item.value * 0.0035);
  const next = Math.max(0.01, item.value + swing);
  return {
    ...item,
    value: next,
    direction: swing >= 0 ? "up" : "down",
    changePct: Number((item.changePct + swing / Math.max(item.value, 1)).toFixed(2)),
  };
}

export function formatValue(item: MarketTicker) {
  const decimals = item.value > 1000 ? 2 : 2;
  return `${item.prefix ?? ""}${item.value.toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${item.unit ?? ""}`;
}
