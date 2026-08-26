/**
 * Runtime configuration. Never hardcode the backend URL.
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local / your hosting env.
 */
export const API_BASE_URL = (process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "").replace(/\/+$/, "");

if (!API_BASE_URL && process.env.NODE_ENV !== "production") {
  console.warn("[eshspeaks] NEXT_PUBLIC_API_BASE_URL is not set — auth requests will fail.");
}
