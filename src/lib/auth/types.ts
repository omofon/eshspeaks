/**
 * Types mirror the EshSpeaks API response confirmed live from
 * POST /auth/email/verify and GET /auth/me.
 *
 * CONFIRMED from a real response: role "reader", membershipTier "FREE".
 * Everything else in these unions is UNCONFIRMED — the backend team has not
 * handed over the literal enum values yet. Do not treat the extra role
 * strings below as real; they're typed loosely on purpose until confirmed.
 */

/** Confirmed by backend (Prisma: MembershipTier enum, @map to lower-case). */
export type MembershipTier = "FREE" | "PREMIUM";

/**
 * Confirmed by backend (Prisma: UserRole enum). Values are the API's
 * lower_snake_case wire format, not the Prisma identifier names.
 *
 * NOTE: "premium" here MIRRORS MembershipTier.PREMIUM per the backend's own
 * schema comment — it is not a separate paid tier, it's the same fact
 * expressed on two fields. Don't use role==="premium" to gate paywalled
 * content; use membershipTier==="PREMIUM" for that (see isSubscriber in
 * AuthProvider). Use `role` only for editorial-capability rank checks.
 *
 * There is no "admin" role in this list — chief_editor is the ceiling.
 */
export type UserRole =
  "reader" | "premium" | "contributor" | "state_correspondent" | "section_lead" | "chief_editor";

export interface CurrentUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  membershipTier: MembershipTier;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds, confirmed 900 live
  authenticated: boolean;
}

export interface OnboardingState {
  required: boolean;
  step?: string;
}

export interface VerifyResult {
  user: CurrentUser;
  session: SessionTokens;
  onboarding: OnboardingState;
  redirect?: { to: string };
}
