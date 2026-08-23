import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { maskEmail } from "@/lib/auth/maskEmail";
import OTPForm from "@/components/auth/OTPForm";
import { getSafeReturnTo } from "@/lib/auth/returnTo";

export const metadata = {
  title: "Check your email",
  description:
    "Enter the verification code we sent to your email to finish signing in to EshSpeaks.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; returnTo?: string; action?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const { email, action, mode } = params;
  const authMode = mode === "register" ? "register" : "login";
  if (!email) redirect(`/login${authMode === "register" ? "?mode=register" : ""}`);

  // /verify is directly reachable by URL, so we can't trust that returnTo
  // arrived here via the login page's validation — normalize again.
  const safeReturnTo = getSafeReturnTo(params.returnTo);

  const otpProps = {
    returnTo: safeReturnTo,
    ...(action !== undefined ? { action } : {}),
    mode: authMode,
  } satisfies { returnTo: string; action?: string; mode: "login" | "register" };

  const startOverHref = (() => {
    const qs = new URLSearchParams();
    if (authMode === "register") qs.set("mode", "register");
    if (safeReturnTo !== "/") qs.set("returnTo", safeReturnTo);
    if (action) qs.set("action", action);
    const s = qs.toString();
    return `/login${s ? `?${s}` : ""}`;
  })();

  return (
    <AuthShell
      kicker="Verification"
      title="Check your email"
      description={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-mono text-text-primary">{maskEmail(email)}</span>.
        </>
      }
      footer={
        <p className="text-center text-[13px] text-text-secondary">
          Wrong address?{" "}
          <Link
            href={startOverHref}
            className="font-semibold text-navy underline underline-offset-2 hover:text-accent"
          >
            Start over
          </Link>
        </p>
      }
    >
      <OTPForm email={email} {...otpProps} />
    </AuthShell>
  );
}
