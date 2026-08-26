import Link from "next/link";
import { Check, Lock } from "lucide-react";

/**
 * FIXED: this used to self-gate on `isSubscriber` (plus a dev tier
 * override that could never affect a real request anyway) and return null
 * for subscribers. That was backwards — nothing rendered this
 * conditionally, so it never actually hid itself from a subscriber; worse,
 * a dev "preview as premium" override has no way to make the *backend*
 * return the real article body, so letting it hide the panel would have
 * shown an empty gap where the story should be.
 *
 * Per the product spec, GET /articles/:slug is server-gated — the caller
 * (see ArticlePaywall) decides whether to mount this at all based on
 * whether the response actually included the article body
 * (isArticleUnlocked()). This component's only job is to render the
 * upsell once that decision has already been made; it has no gating logic
 * of its own to keep in sync with the backend.
 */
export function PaywallPanel({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <section className="relative mt-8 rounded-md border border-gold bg-card p-6 shadow-card">
      <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-[11px] font-medium text-gold-foreground">
        <Lock className="h-3 w-3" strokeWidth={2} />
        Premium reporting
      </div>
      <h2 className="mt-2 font-serif text-2xl text-navy">
        The rest of this story is for subscribers
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        This piece is built on documents and first-hand briefings. Premium keeps that reporting
        funded, removes advertising, and unlocks the full archive across all eight sections.
      </p>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {[
          "Full access to premium investigations",
          "Ad-free reading across the site",
          "The market dashboard and data notes",
          "Section newsletters, curated weekly",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/pricing"
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-navy"
        >
          See plans
        </Link>
        {!signedIn ? (
          <Link
            href="/login?action=subscribe"
            className="text-xs font-medium text-navy hover:underline"
          >
            Already a subscriber? Sign in
          </Link>
        ) : null}
      </div>
    </section>
  );
}
