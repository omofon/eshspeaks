"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PremiumBadge } from "@/components/editorial";

const EDITORIAL_ROLES = [
  "contributor",
  "state_correspondent",
  "section_lead",
  "chief_editor",
] as const;

const ROLE_LABEL: Record<string, string> = {
  reader: "Reader",
  premium: "Premium reader",
  contributor: "Contributor",
  state_correspondent: "State correspondent",
  section_lead: "Section lead",
  chief_editor: "Chief editor",
};

export default function AccountPage() {
  const { user, status, isAuthenticated, isSubscriber, role, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login?returnTo=%2Faccount");
  }, [status, router]);

  if (status === "loading" || !isAuthenticated || !user) {
    return <div className="py-16 text-center text-text-secondary">Loading your account\u2026</div>;
  }

  const isEditorial = EDITORIAL_ROLES.includes(role as (typeof EDITORIAL_ROLES)[number]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-border bg-card p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          Account
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl text-brand-navy sm:text-5xl">
            {user.displayName ?? user.username ?? user.email.split("@")[0]}
          </h1>
          {isSubscriber ? <PremiumBadge /> : null}
        </div>
        <p className="mt-2 text-sm text-text-secondary">{user.email}</p>
        <p className="mt-1 text-sm text-text-secondary">
          {ROLE_LABEL[role] ?? role}
          {isEditorial ? (
            <>
              {" \u00b7 "}
              <Link href="/admin" className="font-medium text-brand-orange hover:underline">
                Go to newsroom admin
              </Link>
            </>
          ) : null}
        </p>

        {/* Subscription */}
        <div className="mt-8 border-t border-border pt-6">
          <h2 className="font-serif text-2xl text-brand-navy">Subscription</h2>
          {isSubscriber ? (
            <p className="mt-2 text-sm text-text-secondary">
              You're on Premium. Manage billing from the subscriptions page.
              {/* TODO: no billing/subscription-management endpoint confirmed
                  yet — wire this Link once that route exists. */}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-sm text-text-secondary">You're on the free plan.</p>
              <Link
                href="/pricing"
                className="rounded-sm bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-navy"
              >
                Upgrade to Premium
              </Link>
            </div>
          )}
        </div>

        {/* Activity — TODO: backend has no confirmed likes/comments/reposts
            endpoints yet. This section is a shell; wire it once those
            routes exist. Don't fetch a guessed endpoint here. */}
        <div className="mt-8 border-t border-border pt-6">
          <h2 className="font-serif text-2xl text-brand-navy">Your activity</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <ActivityStub label="Liked" />
            <ActivityStub label="Comments" />
            <ActivityStub label="Reposts" />
          </div>
        </div>

        {isEditorial ? (
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-serif text-2xl text-brand-navy">Editorial</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Your role ({ROLE_LABEL[role] ?? role}) has newsroom access.
              {/* TODO: role-specific stats (drafts pending, assigned state,
                  section queue) once the CMS endpoints for those exist. */}
            </p>
          </div>
        ) : null}
      </section>

      <aside className="rounded-lg border border-border bg-background-soft p-6">
        <h2 className="font-serif text-2xl text-brand-navy">Quick links</h2>
        <ul className="mt-4 space-y-3 text-sm text-text-secondary">
          <li>
            <Link href="/account/saved" className="font-medium text-brand-orange hover:underline">
              Saved articles
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="font-medium text-brand-orange hover:underline">
              Pricing
            </Link>
          </li>
          {isEditorial ? (
            <li>
              <Link href="/admin" className="font-medium text-brand-orange hover:underline">
                Newsroom admin
              </Link>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              onClick={() => void signOut()}
              className="font-medium text-brand-orange hover:underline"
            >
              Sign out
            </button>
          </li>
        </ul>
      </aside>
    </div>
  );
}

function ActivityStub({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 text-center">
      <p className="text-2xl font-semibold text-brand-navy">\u2014</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-text-secondary">{label}</p>
    </div>
  );
}
