import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import OTPForm, { maskEmail } from "@/components/auth/OTPForm";

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
  const { email, returnTo, action, mode } = params;
  const authMode = mode === "register" ? "register" : "login";
  if (!email) redirect(`/login${authMode === "register" ? "?mode=register" : ""}`);
  const otpProps = {
    ...(returnTo !== undefined ? { returnTo } : {}),
    ...(action !== undefined ? { action } : {}),
    mode: authMode,
  } satisfies { returnTo?: string; action?: string; mode: "login" | "register" };

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
            href={`/login${authMode === "register" ? "?mode=register" : ""}`}
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
