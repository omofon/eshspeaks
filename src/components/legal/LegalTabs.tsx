"use client";

import { useEffect, useState } from "react";

const TABS = [
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms of Service" },
  { key: "guidelines", label: "Community Guidelines" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTabKey(value: string): value is TabKey {
  return (TABS as readonly { key: string }[]).some((t) => t.key === value);
}

export function LegalTabs() {
  const [active, setActive] = useState<TabKey>("privacy");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (isTabKey(hash)) setActive(hash);
  }, []);

  return (
    <div>
      <h1 className="mb-5 text-[30px] font-semibold text-ink">Legal</h1>
      <div className="mb-6.5 flex flex-wrap gap-2 border-b-2 border-line pb-3.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`rounded-full border-2 border-ink px-4 py-2.5 text-[13px] font-bold ${
              active === tab.key ? "bg-ink text-white" : "bg-white text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "privacy" ? (
        <div className="text-[14.5px] leading-[1.7] text-ink-soft">
          <h2 className="mb-2.5 text-xl font-semibold text-ink">Privacy Policy</h2>
          <p className="mb-3.5">
            Colouresh, a product of EshSpeaks LLP, collects the information you give us directly:
            your name and email when you subscribe to a newsletter, register for The List, RSVP to
            an event, or post on The Seat. We also collect basic usage data (pages viewed, device
            type) to keep the site running well.
          </p>
          <h2 className="mb-2.5 mt-6.5 text-xl font-semibold text-ink">What we don&rsquo;t do</h2>
          <p className="mb-3.5">
            We don&rsquo;t sell your personal data to third parties. We don&rsquo;t share your
            comment history or membership tier with advertisers.
          </p>
          <h2 className="mb-2.5 mt-6.5 text-xl font-semibold text-ink">Your choices</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Unsubscribe from any newsletter at any time via the link in each email</li>
            <li>Request a copy or deletion of your data by contacting us</li>
            <li>Control cookie preferences from your browser settings</li>
          </ul>
        </div>
      ) : null}

      {active === "terms" ? (
        <div className="text-[14.5px] leading-[1.7] text-ink-soft">
          <h2 className="mb-2.5 text-xl font-semibold text-ink">Using Colouresh</h2>
          <p className="mb-3.5">
            By reading, commenting, or subscribing on Colouresh, you agree to use the platform
            respectfully and lawfully. Premium content is licensed for personal reading only, not
            redistribution.
          </p>
          <h2 className="mb-2.5 mt-6.5 text-xl font-semibold text-ink">Membership (The List)</h2>
          <p className="mb-3.5">
            The List membership tiers (Grey, Slate, Bold) are billed as described at signup. Perks,
            event access, and pricing may be updated with notice.
          </p>
          <h2 className="mb-2.5 mt-6.5 text-xl font-semibold text-ink">Content ownership</h2>
          <p className="mb-3.5">
            Stories you submit via Share Your Story remain yours, but you grant Colouresh the right
            to edit, publish, and promote them across the platform once accepted.
          </p>
        </div>
      ) : null}

      {active === "guidelines" ? (
        <div className="text-[14.5px] leading-[1.7] text-ink-soft">
          <h2 className="mb-2.5 text-xl font-semibold text-ink">
            The Seat is an open floor, with rules
          </h2>
          <p className="mb-3.5">
            Disagree with the argument, not the person. Threads on Politics and Governance, and
            Security Watch topics, are held to a higher standard given the sensitivity of the
            subject matter.
          </p>
          <h2 className="mb-2.5 mt-6.5 text-xl font-semibold text-ink">Not allowed</h2>
          <ul className="mb-3.5 list-disc space-y-1.5 pl-5">
            <li>Harassment, hate speech, or targeted abuse of any individual or group</li>
            <li>Deliberate misinformation presented as fact</li>
            <li>Doxxing or sharing private information about others</li>
            <li>Spam, unsolicited advertising, or coordinated brigading of a thread</li>
          </ul>
          <h2 className="mb-2.5 mt-6.5 text-xl font-semibold text-ink">Moderation</h2>
          <p>
            Comments on Politics and Security Watch content are held for review on flagged keywords
            before appearing publicly. Repeated violations lead to a suspended account.
          </p>
        </div>
      ) : null}
    </div>
  );
}
