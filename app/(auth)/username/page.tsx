import AuthShell from "@/components/auth/AuthShell";
import UsernameForm from "@/components/auth/UsernameForm";
import { getSafeReturnTo } from "@/lib/auth/returnTo";

export const metadata = {
  title: "Choose your username",
  description: "Pick the public name other readers will see when you comment on EshSpeaks.",
};

export default async function UsernamePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; action?: string }>;
}) {
  const params = await searchParams;

  // Also directly reachable by URL — normalize here too rather than trust
  // that it was already validated upstream.
  const safeReturnTo = getSafeReturnTo(params.returnTo);

  return (
    <AuthShell
      kicker="Public profile"
      title="Choose your username"
      description="This is the name other readers will see when you comment on EshSpeaks."
    >
      <UsernameForm returnTo={safeReturnTo} />
    </AuthShell>
  );
}
