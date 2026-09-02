"use client";

import { useState } from "react";
import { initializeCheckout, PaymentsApiError } from "@/lib/api/payments";

/**
 * Starts a Paystack checkout and hands off to their hosted page. The
 * backend configures where Paystack redirects back to; this hook only
 * owns the "create the session and leave" step.
 */
export function useCheckout() {
  const [status, setStatus] = useState<"idle" | "starting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setStatus("starting");
    setError(null);
    try {
      const session = await initializeCheckout();
      try {
        window.sessionStorage.setItem("esh.checkoutRef", session.reference);
      } catch {
        // storage may be unavailable; the reference also comes back on the redirect
      }
      window.location.assign(session.authorizationUrl);
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof PaymentsApiError
          ? e.message
          : "We could not start checkout. Please try again.",
      );
    }
  }

  return { start, status, error };
}
