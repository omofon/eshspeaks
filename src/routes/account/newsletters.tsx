import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { sections } from "@/lib/data/sections";

export const Route = createFileRoute("/account/newsletters")({
  component: NewslettersPage,
  head: () => ({
    meta: [
      { title: "Newsletters — EshSpeaks" },
      { name: "description", content: "Choose the EshSpeaks newsletters you receive, including per-section curated sends." },
      { property: "og:title", content: "Newsletters — EshSpeaks" },
      { property: "og:description", content: "Manage EshSpeaks newsletter subscriptions." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/account/newsletters" },
    ],
    links: [{ rel: "canonical", href: "/account/newsletters" }],
  }),
});

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`h-6 w-11 shrink-0 rounded-sm border p-0.5 transition-colors ${
        on ? "border-accent bg-accent" : "border-border bg-muted"
      }`}
    >
      <span
        className={`block h-4.5 w-4.5 rounded-sm bg-background transition-transform ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
        style={{ height: "1.125rem", width: "1.125rem" }}
      />
    </button>
  );
}

function NewslettersPage() {
  const [general, setGeneral] = useState(true);
  const [subscribed, setSubscribed] = useState<string[]>(["politics", "security-watch"]);
  const [saved, setSaved] = useState(false);

  return (
    <SiteShell>
      <nav className="text-sm">
        <Link to="/account" className="text-accent hover:underline">
          Account
        </Link>
        <span className="text-muted-foreground"> / Newsletters</span>
      </nav>

      <h1 className="mt-3 font-serif text-4xl text-navy">Newsletters</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Choose what lands in your inbox. Section sends go out weekly, the morning brief every weekday.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-center justify-between border-y border-rule py-4">
            <div>
              <p className="text-sm font-medium">The morning brief</p>
              <p className="text-sm text-muted-foreground">Daily, before 7am WAT</p>
            </div>
            <Toggle on={general} onClick={() => setGeneral((v) => !v)} label="The morning brief" />
          </div>

          <ul className="divide-y divide-border">
            {sections.map((s) => {
              const on = subscribed.includes(s.slug);
              return (
                <li key={s.slug} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.blurb}</p>
                  </div>
                  <Toggle
                    on={on}
                    label={s.name}
                    onClick={() =>
                      setSubscribed((prev) => (on ? prev.filter((x) => x !== s.slug) : [...prev, s.slug]))
                    }
                  />
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="rounded-sm bg-navy px-4 py-2 text-sm font-medium text-background hover:bg-accent"
            >
              Save preferences
            </button>
            {saved ? (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-accent" strokeWidth={2} />
                Preferences saved
              </span>
            ) : null}
          </div>
        </div>

        <aside>
          <NewsletterSignup variant="large" />
        </aside>
      </div>
    </SiteShell>
  );
}
