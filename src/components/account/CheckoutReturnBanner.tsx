"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { verifyPayment, isPaymentNotFound } from "@/lib/api/payments";

const POLL_MS = 2500;
const MAX_TRIES = 8;

type BannerState = "idle" | "checking" | "success" | "failed" | "unknown";

/**
 * Handles the return from Paystack. The backend redirect lands on
 * /account with the checkout reference in the query (as `checkout`,
 * `reference` or Paystack's `trxref`). The webhook is the source of truth,
 * so this only polls `GET /payments/verify/{reference}` to move the UI
 * along, then refreshes the session so a new PREMIUM tier shows at once.
 */
export function CheckoutReturnBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const { refresh } = useAuth();
  const reference =
    params.get("checkout") ?? params.get("reference") ?? params.get("trxref") ?? null;
  const [state, setState] = useState<BannerState>("idle");
  const started = useRef(false);

  useEffect(() => {
    if (!reference || started.current) return;
    started.current = true;
    setState("checking");

    let stopped = false;
    let tries = 0;

    const settle = (next: BannerState) => {
      if (stopped) return;
      setState(next);
      router.replace("/account");
    };

    const poll = async () => {
      if (stopped) return;
      tries += 1;
      try {
        const result = await verifyPayment(reference);
        if (result.status === "success") {
          await refresh();
          settle("success");
          return;
        }
        if (result.status === "failed" || result.status === "abandoned") {
          settle("failed");
          return;
        }
      } catch (e) {
        if (!isPaymentNotFound(e)) {
          settle("unknown");
          return;
        }
        // Not on record yet: the webhook may still be in flight, keep polling.
      }
      if (tries >= MAX_TRIES) {
        settle("unknown");
        return;
      }
      window.setTimeout(() => void poll(), POLL_MS);
    };

    void poll();
    return () => {
      stopped = true;
    };
  }, [reference, refresh, router]);

  if (state === "idle") return null;

  if (state === "checking") {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-md border border-border bg-background-soft px-4 py-3 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Confirming your payment. This usually takes a few seconds.
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-md border border-success bg-success-soft px-4 py-3 text-sm text-success">
        <CheckCircle2 className="h-4 w-4" />
        Payment confirmed. Your Premium access is active.
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-md border border-error bg-error-soft px-4 py-3 text-sm text-error">
        <XCircle className="h-4 w-4" />
        That payment did not go through. Nothing was charged. You can try again from Pricing.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-md border border-border bg-background-soft px-4 py-3 text-sm text-text-secondary">
      We could not confirm the payment yet. If you completed checkout, your access will appear here
      once it settles.
    </div>
  );
}

export default CheckoutReturnBanner;
