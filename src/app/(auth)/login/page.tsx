import Link from "next/link";
import type { Route } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import AuthDivider from "@/components/auth/AuthDivider";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import EmailAuthForm from "@/components/auth/EmailAuthForm";
import { getSafeReturnTo, buildContinuationQuery } from "@/lib/auth/returnTo";

export const metadata = {
  title: "Sign in to Colouresh",
  description: "Sign in to comment, save stories and manage your Colouresh account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; action?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const { action, mode } = params;

  // Normalize once, at the entry point, and use safeReturnTo for
  // everything from here down — never the raw searchParams value.
  const safeReturnTo = getSafeReturnTo(params.returnTo);
  const isRegister = mode === "register";

  const continuation = {
    returnTo: safeReturnTo,
    ...(action !== undefined ? { action } : {}),
  } satisfies { returnTo: string; action?: string };

  // Preserve returnTo/action when the user toggles between sign-in and
  // create-account — previously these links dropped the destination.
  const toggleModeHref = isRegister
    ? `/login${buildContinuationQuery({ returnTo: safeReturnTo, action })}`
    : `/login?mode=register${buildContinuationQuery({ returnTo: safeReturnTo, action }).replace("?", "&")}`;

  return (
    <AuthShell
      kicker={isRegister ? "Membership" : "Welcome back"}
      title={
        isRegister ? (
          <>
            Create your
            <br />
            <em className="font-normal italic">account.</em>
          </>
        ) : (
          <>
            Return to the
            <br />
            <em className="font-normal italic">conversation.</em>
          </>
        )
      }
      description={
        isRegister
          ? "Join the conversation, save stories, and get more from Colouresh."
          : "Your daily read, considered from every angle."
      }
      footer={
        <div className="space-y-4">
          <p className="text-[10px] leading-5 text-ink-soft">
            By continuing, you agree to Colouresh&rsquo;s{" "}
            <Link
              href="/terms"
              className="text-ink underline decoration-purple decoration-2 underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-ink underline decoration-purple decoration-2 underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <p className="border-t border-line pt-4 text-[13px] text-ink-soft">
            {isRegister ? "Already have an account?" : "New to Colouresh?"}{" "}
            <Link
              href={toggleModeHref as Route}
              className="font-semibold text-ink underline decoration-purple decoration-2 underline-offset-4"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      }
    >
      {/* Primary credential path first, social second — matches the
          reworked split-screen layout. `action` is always forwarded to
          SocialAuthButtons too; it was silently dropped for Google before. */}
      <Suspense>
        <EmailAuthForm mode={isRegister ? "register" : "login"} {...continuation} />
      </Suspense>
      <AuthDivider label="or continue with" />
      <SocialAuthButtons {...continuation} />
    </AuthShell>
  );
}
