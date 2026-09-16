"use client";

import { useState, type FormEvent } from "react";
import { LeadFormConfirm } from "./LeadFormConfirm";

const TYPES = [
  { key: "vendor", label: "Vendor" },
  { key: "investor", label: "Investor" },
  { key: "partner", label: "Brand Partner" },
] as const;

type TypeKey = (typeof TYPES)[number]["key"];

function isTypeKey(value: string | undefined): value is TypeKey {
  return !!value && (TYPES as readonly { key: string }[]).some((t) => t.key === value);
}

/** No /seat/partner-enquiries endpoint confirmed live yet (specced in
 *  CMS-BACKEND-REQUESTS-2 B1) — confirms locally for now. */
export function PartnerForm({ initialType }: { initialType?: string | undefined }) {
  const [type, setType] = useState<TypeKey>(isTypeKey(initialType) ? initialType : "vendor");
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    return (
      <LeadFormConfirm
        accent="var(--purple)"
        title="Thanks, that's in"
        description="The partnerships team reviews every enquiry and replies within a few business days."
        backHref="/"
        backLabel="Back to the Front Desk"
      />
    );
  }

  return (
    <div>
      <span className="chip">
        <span className="inline-block h-2 w-2 rounded-full bg-purple" />
        Work with Colouresh
      </span>
      <h1 className="mb-2 mt-3.5 text-[32px] font-semibold text-ink">Partner With Us</h1>
      <p className="mb-6.5 max-w-[480px] text-[14.5px] text-ink-soft">
        Vendors, investors, and brands, pick what best describes you and we&rsquo;ll route it to the
        right person.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={`rounded-full border-2 px-4.5 py-2.5 text-[13px] font-bold ${
              type === t.key
                ? "border-purple-deep bg-purple text-white"
                : "border-ink bg-white text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border-2 border-ink bg-white p-7"
        style={{ boxShadow: "6px 6px 0 var(--purple)" }}
      >
        <label className="mb-1.5 block text-xs font-bold text-ink">Full name</label>
        <input
          type="text"
          required
          placeholder="Your name"
          className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        />
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Email</label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">
              Company / organisation
            </label>
            <input
              type="text"
              placeholder="Company name"
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {type === "vendor" ? (
          <>
            <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">
              What do you supply or offer?
            </label>
            <input
              type="text"
              placeholder="e.g. event logistics, printing, video production"
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
          </>
        ) : null}

        {type === "investor" ? (
          <>
            <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">Area of interest</label>
            <select className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none">
              <option>Media & content</option>
              <option>Membership / community</option>
              <option>Advertising infrastructure</option>
              <option>Not sure yet</option>
            </select>
          </>
        ) : null}

        {type === "partner" ? (
          <>
            <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">
              What kind of collaboration?
            </label>
            <select className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none">
              <option>Sponsorship</option>
              <option>Cross-border / cultural campaign</option>
              <option>Content partnership</option>
              <option>Event co-hosting</option>
            </select>
          </>
        ) : null}

        <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">Message</label>
        <textarea
          placeholder="Tell us a bit about what you have in mind..."
          className="min-h-[90px] w-full resize-y rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        />

        <div className="mt-5.5 flex justify-end">
          <button type="submit" className="btn-purple">
            Send Enquiry
          </button>
        </div>
      </form>
    </div>
  );
}
