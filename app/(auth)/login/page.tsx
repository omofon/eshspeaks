import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import AuthDivider from "@/components/auth/AuthDivider";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import EmailAuthForm from "@/components/auth/EmailAuthForm";

export const metadata = {
  title: "Sign in to EshSpeaks",
  description: "Sign in to comment, save stories and manage your EshSpeaks account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; action?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const { returnTo, action, mode } = params;
  const isRegister = mode === "register";
  const emailProps = {
    ...(returnTo !== undefined ? { returnTo } : {}),
    ...(action !== undefined ? { action } : {}),
  } satisfies { returnTo?: string; action?: string };

  return (
    <AuthShell
      kicker={isRegister ? "Membership" : "Account"}
      title={isRegister ? "Create your EshSpeaks account" : "Sign in to EshSpeaks"}
      description="Join the conversation, save stories, and get more from EshSpeaks."
      footer={
        <p className="text-center text-[13px] text-text-secondary">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-navy underline underline-offset-2 hover:text-accent"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to EshSpeaks?{" "}
              <Link
                href="/login?mode=register"
                className="font-semibold text-white underline underline-offset-2 hover:text-accent"
              >
                Create an account
              </Link>
            </>
          )}
        </p>
      }
    >
      {returnTo ? <SocialAuthButtons returnTo={returnTo} /> : <SocialAuthButtons />}
      <AuthDivider />
      <Suspense>
        <EmailAuthForm mode={isRegister ? "register" : "login"} {...emailProps} />
      </Suspense>

      <p className="mt-6 text-[12px] leading-5 text-text-muted">
        By continuing, you agree to EshSpeaks&rsquo;{" "}
        <Link
          href="/terms"
          className="underline decoration-rule underline-offset-2 hover:text-text-secondary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline decoration-rule underline-offset-2 hover:text-text-secondary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}
