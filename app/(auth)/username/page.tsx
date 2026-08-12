import AuthShell from "@/components/auth/AuthShell";
import UsernameForm from "@/components/auth/UsernameForm";

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
  const { returnTo } = params;

  return (
    <AuthShell
      kicker="Public profile"
      title="Choose your username"
      description="This is the name other readers will see when you comment on EshSpeaks."
    >
      {returnTo ? <UsernameForm returnTo={returnTo} /> : <UsernameForm />}
    </AuthShell>
  );
}
