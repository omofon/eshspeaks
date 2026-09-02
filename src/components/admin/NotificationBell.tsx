"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  isNotificationsUnavailable,
  type AdminNotification,
} from "@/lib/api/notifications";

/**
 * Admin notification bell + dropdown.
 *
 * Wired to the contract in CMS-BACKEND-REQUESTS.md (P2.5). That endpoint
 * isn't live yet, so the query fails with a 404 and the panel shows a
 * "pending backend" message instead of an error. Nothing else needs to
 * change here once the endpoint ships.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick<HTMLDivElement>(useCallback(() => setOpen(false), []));
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => fetchNotifications({ status: "all", limit: 20 }),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: false,
  });

  const unavailable = isNotificationsUnavailable(error);
  const items = data?.items ?? [];
  const unread = data?.unreadCount ?? 0;

  async function onItemClick(n: AdminNotification) {
    if (!n.read) {
      try {
        await markNotificationRead(n.id);
        void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      } catch {
        /* non-critical */
      }
    }
    setOpen(false);
  }

  async function onMarkAll() {
    try {
      await markAllNotificationsRead();
      void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    } catch {
      /* non-critical */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--navy)]"
      >
        <Bell size={18} />
        {unread > 0 ? (
          <span
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-md border shadow-lg"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-2.5"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
              Notifications
            </p>
            {items.some((n) => !n.read) ? (
              <button
                type="button"
                onClick={onMarkAll}
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">Loading…</p>
            ) : unavailable ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                Notifications will appear here once the backend is connected.
              </p>
            ) : error ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--error)]">
                Couldn&rsquo;t load notifications.
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                You&rsquo;re all caught up.
              </p>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                {items.map((n) => {
                  const inner = (
                    <>
                      <div className="flex items-start gap-2">
                        {!n.read ? (
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: "var(--accent)" }}
                          />
                        ) : (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-primary)", fontWeight: n.read ? 400 : 600 }}
                          >
                            {n.title}
                          </p>
                          {n.body ? (
                            <p className="mt-0.5 line-clamp-2 text-[13px] text-[var(--text-secondary)]">
                              {n.body}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                  return (
                    <li key={n.id}>
                      {n.href ? (
                        <Link
                          href={n.href as Route}
                          onClick={() => onItemClick(n)}
                          className="block px-4 py-3 transition-colors hover:bg-[var(--muted)]"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onItemClick(n)}
                          className="block w-full px-4 py-3 text-left transition-colors hover:bg-[var(--muted)]"
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
