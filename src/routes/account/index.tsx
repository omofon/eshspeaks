import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { PremiumBadge } from "@/components/PremiumBadge";
import { mockCommentHistory, mockUser } from "@/lib/data/comments";
import { sections } from "@/lib/data/sections";
import { useTier } from "@/lib/tier";

export const Route = createFileRoute("/account/")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "Your account — EshSpeaks" },
      { name: "description", content: "Manage your EshSpeaks tier, section preferences and comment history." },
      { property: "og:title", content: "Your account — EshSpeaks" },
      { property: "og:description", content: "Tier, preferences and comment history." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/account" },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
});

function AccountPage() {
  const { tier, isPremium, isLoggedIn } = useTier();
  const [followed, setFollowed] = useState<string[]>(["politics", "business-economy", "security-watch"]);

  if (!isLoggedIn) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-serif text-3xl text-navy">You are signed out</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to see your tier, preferences and comment history.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-navy"
          >
            Sign in
          </Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <h1 className="font-serif text-4xl text-navy">Your account</h1>

      <section className="mt-6 rounded-md border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-serif text-2xl text-navy">{mockUser.name}</p>
            <p className="text-sm text-muted-foreground">
              {mockUser.email} · {mockUser.state} · member since {mockUser.joined}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPremium ? (
              <PremiumBadge />
            ) : (
              <span className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground">
                Free tier
              </span>
            )}
            {!isPremium ? (
              <Link
                to="/pricing"
                className="rounded-sm bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-navy"
              >
                Upgrade
              </Link>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Current tier: <span className="font-mono text-foreground">{tier}</span>.{" "}
          {isPremium
            ? "Advertising is hidden and premium articles are unlocked."
            : "Advertising is shown and premium articles are partially locked."}
        </p>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-navy">Section preferences</h2>
          <Link to="/account/newsletters" className="text-sm text-accent hover:underline">
            Newsletter settings
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => {
            const on = followed.includes(s.slug);
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() =>
                  setFollowed((prev) => (on ? prev.filter((x) => x !== s.slug) : [...prev, s.slug]))
                }
                className={`flex items-center justify-between rounded-sm border px-3 py-2 text-sm ${
                  on ? "border-accent text-navy" : "border-border text-muted-foreground"
                }`}
              >
                {s.name}
                {on ? <Check className="h-4 w-4 text-accent" strokeWidth={2} /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rule-top mt-10 pt-6">
        <h2 className="font-serif text-2xl text-navy">Your comments</h2>
        <ul className="mt-3 divide-y divide-border">
          {mockCommentHistory.map((c) => (
            <li key={c.id} className="py-4">
              <p className="font-serif text-base text-navy">{c.articleTitle}</p>
              <p className="mt-1 text-sm leading-relaxed">{c.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.time}</p>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
