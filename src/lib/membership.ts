import type { MembershipTier } from "@/lib/auth/types";

/**
 * Membership tier model for the pricing and account pages.
 *
 * The backend currently exposes a single paid state (`membershipTier`
 * is `FREE` or `PREMIUM`) and `POST /payments/initialize` takes no
 * parameters, so it always produces one PREMIUM checkout. The three-tier
 * shape below is the product target; only Grey (free) and Slate (the live
 * PREMIUM checkout) resolve to something real today. Bold and the yearly
 * cycle are marked not-yet-purchasable until the backend accepts a tier
 * and a billing cycle on initialize (see CMS-BACKEND-REQUESTS.md).
 */

export type TierId = "grey" | "slate" | "bold";
export type BillingCycle = "monthly" | "yearly";

export interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  /** Placeholder pricing in naira, pending a real GET /payments/plans. */
  price: Record<BillingCycle, number>;
  features: string[];
  featured?: boolean;
  /**
   * Which `membershipTier` from GET /auth/me a reader on this tier holds.
   * `null` means the tier is not purchasable yet: the checkout endpoint
   * cannot target it.
   */
  liveTier: MembershipTier | null;
}

export const TIERS: Tier[] = [
  {
    id: "grey",
    name: "Grey",
    tagline: "Essential access and standard benefits.",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Every free story across all sections",
      "Comment and join the discussion",
      "Weekly section newsletters",
    ],
    liveTier: "FREE",
  },
  {
    id: "slate",
    name: "Slate",
    tagline: "Priority access, reserved seating and select perks.",
    price: { monthly: 2500, yearly: 24000 },
    features: [
      "Full premium investigations and interviews",
      "Ad-free reading across the site",
      "The market dashboard and data notes",
      "Reserved seating at live events",
    ],
    featured: true,
    liveTier: "PREMIUM",
  },
  {
    id: "bold",
    name: "Bold",
    tagline: "All-access, premium features and exclusive events.",
    price: { monthly: 6000, yearly: 58000 },
    features: [
      "Everything in Slate",
      "Members-only briefings and archives",
      "Priority entry and venue perks",
      "Physical membership card",
    ],
    liveTier: null,
  },
];

export const tierById = (id: TierId): Tier => {
  const tier = TIERS.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown tier: ${id}`);
  return tier;
};

/** The tier a reader is currently on, resolved from their membershipTier. */
export function currentTierId(membershipTier: MembershipTier): TierId {
  return membershipTier === "PREMIUM" ? "slate" : "grey";
}

/** True when a checkout can actually target this tier and cycle today. */
export function isTierPurchasable(tier: Tier, cycle: BillingCycle): boolean {
  return tier.liveTier === "PREMIUM" && cycle === "monthly";
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Just the money, e.g. "NGN 2,500". Returns "Free" for zero. */
export function formatAmount(amount: number): string {
  return amount === 0 ? "Free" : nairaFormatter.format(amount);
}

/** Money with a cadence suffix, e.g. "NGN 2,500/mo". */
export function formatPrice(amount: number, cycle: BillingCycle): string {
  if (amount === 0) return "Free";
  return `${nairaFormatter.format(amount)}/${cycle === "yearly" ? "yr" : "mo"}`;
}
