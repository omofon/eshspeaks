import { apiRequestPaginated, toQueryString, ApiError, type Paginated } from "@/lib/api/client";
import type { MembershipTier, UserRole } from "@/lib/auth/types";

export { ApiError as AdminUsersApiError } from "@/lib/api/client";

/**
 * Chief-editor user directory.
 *
 * `GET /roles/editorial-users` only returns accounts that already hold an
 * editorial role, so it cannot back a screen that also lists readers and
 * subscribers. This module targets a broader endpoint the backend does not
 * expose yet:
 *
 *   GET /admin/users?role=&tier=&status=&search=&page=&limit=   (auth: chief_editor)
 *     -> Paginated<AdminUserRow>
 *
 * Until it ships, `fetchAdminUsers` 404s and the page degrades to a
 * "pending backend" state (see `isAdminUsersUnavailable`) rather than
 * erroring. Role changes still go through the live `POST /roles/assign`.
 * The proposed contract is written up in CMS-BACKEND-REQUESTS.md.
 */

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "none";

export interface AdminUserRow {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role: UserRole;
  membershipTier: MembershipTier;
  /** Null when the account has never held a paid subscription. */
  subscription: {
    status: SubscriptionStatus;
    /** Plan / tier label, e.g. "The Seat membership - Tier 2". */
    plan: string | null;
    currentPeriodEnd: string | null;
  } | null;
  /** Drives the "active" indicator; null if the backend does not track it. */
  lastActiveAt: string | null;
  createdAt: string;
}

export type AdminUsersParams = {
  role?: UserRole | undefined;
  tier?: MembershipTier | undefined;
  status?: SubscriptionStatus | undefined;
  search?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
};

export function fetchAdminUsers(params: AdminUsersParams = {}): Promise<Paginated<AdminUserRow>> {
  return apiRequestPaginated<AdminUserRow>(`/admin/users${toQueryString(params)}`, {
    method: "GET",
    auth: true,
  });
}

/** True when the failure is "the endpoint isn't live yet", not a real error. */
export function isAdminUsersUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.kind === "not_found" || error.status === 404);
}
