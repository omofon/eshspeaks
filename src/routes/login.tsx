import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useTier } from "@/lib/tier";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — EshSpeaks" },
      { name: "description", content: "Sign in to your EshSpeaks account to comment and manage newsletters." },
      { property: "og:title", content: "Sign in — EshSpeaks" },
      { property: "og:description", content: "Sign in to EshSpeaks." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/login" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
});

function LoginPage() {
  const { setTier } = useTier();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) next["email"] = "Enter a valid email address.";
    if (values.password.length < 8) next["password"] = "Password must be at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setDone(true);
      setTier("free");
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-3xl text-navy">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Create an account
          </Link>
          .
        </p>

        {done ? (
          <div className="mt-6 rounded-md border border-border bg-card p-5">
            <p className="inline-flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-accent" strokeWidth={2} />
              Signed in. This build is mocked, so no session was created.
            </p>
            <Link
              to="/account"
              className="mt-4 inline-block rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-navy"
            >
              Go to account
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {errors["email"] ? <p className="mt-1 text-sm text-down">{errors["email"]}</p> : null}
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={values.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {errors["password"] ? <p className="mt-1 text-sm text-down">{errors["password"]}</p> : null}
            </div>
            <button
              type="submit"
              className="w-full rounded-sm bg-navy px-4 py-2.5 text-sm font-medium text-background hover:bg-accent"
            >
              Sign in
            </button>
          </form>
        )}
      </div>
    </SiteShell>
  );
}
