"use client";

/**
 * Last-resort boundary: only fires when the ROOT layout itself throws (so
 * AuthProvider, fonts, etc. can't be trusted to render) — replaces
 * <html>/<body> entirely, per the Next.js convention. Kept deliberately
 * plain: no Tailwind utility classes, no shared components, since whatever
 * broke the root layout might have broken those too. Inline styles only.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          background: "#F5F1E8",
          color: "#2C2C2A",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem", color: "#0D1B3D" }}>
            EshSpeaks didn&apos;t load
          </h1>
          <p style={{ color: "#2C2C2A", margin: "0 0 1.5rem" }}>
            Something went wrong on our end. Try again, or come back in a moment.
          </p>
          {error.digest ? (
            <p style={{ fontSize: "0.75rem", opacity: 0.6, margin: "0 0 1.5rem" }}>
              Ref: {error.digest}
            </p>
          ) : null}
          <div
            style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "1px solid transparent",
                background: "#C9541F",
                color: "#fff",
                font: "inherit",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#0D1B3D",
                font: "inherit",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
