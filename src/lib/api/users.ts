import { apiRequest } from "@/lib/api/client";

export { ApiError as UsersApiError } from "@/lib/api/client";

/**
 * POST /api/v1/users/me/avatar — multipart, one JPEG/PNG/WebP/AVIF up to
 * 2MB (backend-enforced; SVG rejected). The response body shape isn't
 * documented (Swagger just says "Avatar set"), so callers should re-fetch
 * the current user via AuthProvider.refresh() afterward rather than trust
 * anything returned here — this call is fire-and-refresh, not a source of
 * truth.
 */
export async function uploadAvatar(file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  await apiRequest<unknown>("/users/me/avatar", {
    method: "POST",
    auth: true,
    body: form,
    raw: true,
  });
}

/** DELETE /api/v1/users/me/avatar — same fire-and-refresh contract as uploadAvatar. */
export async function removeAvatar(): Promise<void> {
  await apiRequest<unknown>("/users/me/avatar", { method: "DELETE", auth: true });
}
