import { apiRequest, ApiError, toQueryString } from "@/lib/api/client";

export { ApiError as NotificationsApiError } from "@/lib/api/client";

/**
 * Admin notifications.
 *
 * The backend endpoints described in CMS-BACKEND-REQUESTS.md (P2.5) do not
 * exist yet. These functions call the agreed contract so the UI lights up
 * with no rework once the backend ships; until then every call 404s and
 * `isNotificationsUnavailable()` lets the UI show a "pending backend"
 * state instead of a hard error.
 */

export type NotificationType =
  | "article.submitted_for_review"
  | "article.changes_requested"
  | "article.published"
  | "article.archived"
  | "comment.awaiting_moderation"
  | "role.assigned";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsPage {
  items: AdminNotification[];
  unreadCount: number;
  nextCursor: string | null;
}

/** True when the failure is "the endpoint isn't live yet", not a real error. */
export function isNotificationsUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.kind === "not_found" || error.status === 404);
}

export async function fetchNotifications(
  params: { status?: "unread" | "all"; limit?: number; cursor?: string } = {},
): Promise<NotificationsPage> {
  const data = await apiRequest<{
    items: AdminNotification[];
    meta?: { unreadCount?: number; nextCursor?: string | null };
  }>(`/notifications${toQueryString(params)}`, { method: "GET", auth: true });
  return {
    items: data.items ?? [],
    unreadCount: data.meta?.unreadCount ?? (data.items ?? []).filter((n) => !n.read).length,
    nextCursor: data.meta?.nextCursor ?? null,
  };
}

export function markNotificationRead(id: string): Promise<{ id: string; read: boolean }> {
  return apiRequest(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
    auth: true,
  });
}

export function markAllNotificationsRead(): Promise<{ unreadCount: number }> {
  return apiRequest("/notifications/read-all", { method: "POST", auth: true });
}
