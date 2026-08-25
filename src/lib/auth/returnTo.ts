/**
 * Centralized returnTo validation & continuation helpers.
 * Unchanged from before — no changes needed given the confirmed API shape.
 */

const INTERNAL_ORIGIN = "https://internal.invalid";

export function getSafeReturnTo(returnTo?: string | null): string {
  if (returnTo === undefined || returnTo === null) return "/";

  const trimmed = returnTo.trim();
  if (!trimmed) return "/";

  if (!trimmed.startsWith("/")) return "/";
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return "/";

  let url: URL;
  try {
    url = new URL(trimmed, INTERNAL_ORIGIN);
  } catch {
    return "/";
  }
  if (url.origin !== INTERNAL_ORIGIN) return "/";

  const safePath = `${url.pathname}${url.search}${url.hash}`;
  return safePath.startsWith("/") ? safePath : "/";
}

export interface ContinuationParams {
  returnTo?: string | null;
  action?: string | null;
}

export function buildContinuationQuery(params: ContinuationParams): string {
  const safeReturnTo = getSafeReturnTo(params.returnTo);
  const qs = new URLSearchParams();
  if (safeReturnTo !== "/") qs.set("returnTo", safeReturnTo);
  if (params.action) qs.set("action", params.action);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function buildLoginHref(currentPath: string, action?: string): string {
  return `/login${buildContinuationQuery({ returnTo: currentPath, action })}`;
}
