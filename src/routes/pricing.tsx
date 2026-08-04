import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useTier } from "@/lib/tier";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Premium plans — EshSpeaks" },
      { name: "description", content: "Compare EshSpeaks premium monthly and annual plans: ad-free reading, investigations and the market dashboard." },
      { property: "og:title", content: "Premium plans — EshSpeaks" },
      { property: "og:description", content: "Monthly and annual premium plans." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
});

const freeFeatures = ["Free articles across all sections", "Comment and reply", "General newsletter", "Advertising supported"];
const premiumFeatures = [
  "Every premium investigation",
  "Ad-free reading",
  "The market dashboard",
  "Per-section newsletters",
  "Full archive access",
];

function PricingPage() {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const { setTier, isPremium } = useTier();
  const price = cycle === "monthly" ? "₦4,500" : "₦43,200";
  const per = cycle === "monthly" ? "per month" : "per year, two months free";

  return (
    <SiteShell>
      <div className="border-b border-rule pb-6">
        <h1 className="font-serif text-4xl text-navy">Premium</h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Reader funding pays for documents, travel and time. No advertising, no interruption.
        </p>
      </div>

      <div className="mt-6 flex overflow-hidden rounded-sm border border-border">
        {(["monthly", "annual"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCycle(c)}
            className={`px-4 py-2 text-sm ${
              cycle === c ? "bg-navy text-background" : "bg-card text-foreground hover:text-accent"
            }`}
          >
            {c === "monthly" ? "Monthly" : "Annual"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-md border border-border bg-card p-6">
          <h2 className="font-serif text-2xl text-navy">Free</h2>
          <p className="mt-1 font-mono text-3xl text-navy">₦0</p>
          <p className="text-sm text-muted-foreground">Always</p>
          <ul className="mt-5 space-y-2 text-sm">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setTier("free")}
            className="mt-6 w-full rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-navy hover:border-navy"
          >
            Continue on free
          </button>
        </section>

        <section className="rounded-md border-2 border-gold bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl text-navy">Premium</h2>
            <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-medium text-gold-foreground">
              Premium
            </span>
          </div>
          <p className="mt-1 font-mono text-3xl text-navy">{price}</p>
          <p className="text-sm text-muted-foreground">{per}</p>
          <ul className="mt-5 space-y-2 text-sm">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setTier("premium")}
            className="mt-6 w-full rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-navy"
          >
            {isPremium ? "You are on premium" : `Subscribe ${cycle}`}
          </button>
        </section>
      </div>
    </SiteShell>
  );
}
