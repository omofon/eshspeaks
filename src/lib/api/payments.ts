import { apiRequest, ApiError } from "@/lib/api/client";

export { ApiError as PaymentsApiError } from "@/lib/api/client";

/**
 * Paystack checkout.
 *
 * `POST /payments/initialize` starts a one-time PREMIUM checkout and takes
 * no body. It returns a Paystack authorization URL to send the reader to;
 * the Paystack redirect afterwards is configured on the backend, and the
 * webhook (`POST /payments/webhook`) is the source of truth. `verifyPayment`
 * is only a UX accelerant for polling after the redirect lands.
 */

export interface CheckoutSession {
  authorizationUrl: string;
  reference: string;
  accessCode: string | null;
}

export type PaymentStatus = "pending" | "processing" | "success" | "failed" | "abandoned";

export interface PaymentVerification {
  reference: string;
  status: PaymentStatus;
  /** Present on a settled attempt; the backend decides the shape. */
  membershipTier?: string | null;
  paidAt?: string | null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function initializeCheckout(): Promise<CheckoutSession> {
  const data = await apiRequest<Record<string, unknown>>("/payments/initialize", {
    method: "POST",
    auth: true,
  });
  const authorizationUrl = str(data["authorizationUrl"]) ?? str(data["authorization_url"]);
  const reference = str(data["reference"]);
  if (!authorizationUrl || !reference) {
    throw new ApiError("server", "Checkout could not be started. Try again in a moment.");
  }
  return {
    authorizationUrl,
    reference,
    accessCode: str(data["accessCode"]) ?? str(data["access_code"]),
  };
}

/** True when verify reports the attempt simply is not on record (yet). */
export function isPaymentNotFound(error: unknown): boolean {
  return error instanceof ApiError && (error.kind === "not_found" || error.status === 404);
}

export async function verifyPayment(reference: string): Promise<PaymentVerification> {
  const data = await apiRequest<Record<string, unknown>>(
    `/payments/verify/${encodeURIComponent(reference)}`,
    { method: "GET", auth: true },
  );
  const rawStatus = (str(data["status"]) ?? "pending").toLowerCase();
  const status: PaymentStatus = (
    ["pending", "processing", "success", "failed", "abandoned"] as const
  ).includes(rawStatus as PaymentStatus)
    ? (rawStatus as PaymentStatus)
    : "pending";
  return {
    reference,
    status,
    membershipTier: str(data["membershipTier"]),
    paidAt: str(data["paidAt"]),
  };
}
