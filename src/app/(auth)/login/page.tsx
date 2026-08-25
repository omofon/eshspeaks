import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import AuthDivider from "@/components/auth/AuthDivider";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import EmailAuthForm from "@/components/auth/EmailAuthForm";
import { getSafeReturnTo, buildContinuationQuery } from "@/lib/auth/returnTo";

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
      kicker={isRegister ? "Membership" : "Account"}
      title={isRegister ? "Create your EshSpeaks account" : "Sign in to EshSpeaks"}
      description="Join the conversation, save stories, and get more from EshSpeaks."
      footer={
        <></>
        // <p className="text-center text-[13px] text-text-secondary">
        //   {isRegister ? (
        //     <>
        //       Already have an account?{" "}
        //       <Link
        //         href={toggleModeHref}
        //         className="font-semibold text-white underline underline-offset-2 hover:text-accent"
        //       >
        //         Sign in
        //       </Link>
        //     </>
        //   ) : (
        //     <>
        //       New to EshSpeaks?{" "}
        //       <Link
        //         href={toggleModeHref}
        //         className="font-semibold text-white underline underline-offset-2 hover:text-accent"
        //       >
        //         Create an account
        //       </Link>
        //     </>
        //   )}
        // </p>
      }
    >
      {/* Previously only returnTo was forwarded here, silently dropping
          `action` for Google sign-in. Both are always passed now. */}
      <SocialAuthButtons {...continuation} />
      <AuthDivider />
      <Suspense>
        <EmailAuthForm mode={isRegister ? "register" : "login"} {...continuation} />
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
