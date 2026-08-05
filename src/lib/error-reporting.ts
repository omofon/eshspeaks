// Client-side error reporting seam. Nothing is sent anywhere by default — wire
// this to your provider of choice (Sentry, Vercel Analytics, a custom endpoint)
// by filling in reportClientError.

export function reportClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // Loaders and server fns commonly throw a raw Response; String(it) is the
  // opaque "[object Response]", so pull out the status and URL instead.
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[client error]", message, {
    route: window.location.pathname,
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    ...context,
  });
}
