import { apiRequest } from "@/lib/api/client";
import type { ApiEditorialUser } from "@/lib/api/types";
import type { UserRole } from "@/lib/auth/types";

export { ApiError as RolesApiError } from "@/lib/api/client";

/** GET /api/v1/roles/editorial-users — every account holding an editorial role. Chief Editor / relevant editorial roles only. */
export async function fetchEditorialUsers(): Promise<ApiEditorialUser[]> {
  const data = await apiRequest<unknown>("/roles/editorial-users", { method: "GET", auth: true });
  return Array.isArray(data) ? (data as ApiEditorialUser[]) : [];
}

/**
 * POST /api/v1/roles/assign — promotes an existing account (must have
 * signed in at least once). Cannot change your own role; cannot demote
 * the last Chief Editor (backend enforces both — 403/409).
 */
export function assignRole(userId: string, role: UserRole): Promise<ApiEditorialUser> {
  return apiRequest<ApiEditorialUser>("/roles/assign", {
    method: "POST",
    auth: true,
    body: { userId, role },
  });
}

/**
 * POST /api/v1/roles/sections — replaces the user's full section
 * assignment set; [] revokes all. Only Contributor / State Correspondent /
 * Section Lead accept assignments — Chief Editor is global and needs none.
 */
export function assignSections(userId: string, sectionIds: string[]): Promise<ApiEditorialUser> {
  return apiRequest<ApiEditorialUser>("/roles/sections", {
    method: "POST",
    auth: true,
    body: { userId, sectionIds },
  });
}
