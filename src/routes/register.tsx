import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useTier } from "@/lib/tier";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create an account — EshSpeaks" },
      {
        name: "description",
        content: "Create a free EshSpeaks account to comment, follow sections and get newsletters.",
      },
      { property: "og:title", content: "Create an account — EshSpeaks" },
      { property: "og:description", content: "Join EshSpeaks." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/register" },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
});

function RegisterPage() {
  const { setTier } = useTier();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next["name"] = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
      next["email"] = "Enter a valid email address.";
    if (values.password.length < 8) next["password"] = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setDone(true);
      setTier("free");
    }
  }

  const fields = [
    { key: "name" as const, label: "Full name", type: "text" },
    { key: "email" as const, label: "Email address", type: "text" },
    { key: "password" as const, label: "Password", type: "password" },
  ];

  return (
    <SiteShell>
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-3xl text-navy">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
          .
        </p>

        {done ? (
          <div className="mt-6 rounded-md border border-border bg-card p-5">
            <p className="inline-flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-accent" strokeWidth={2} />
              Account created on the free tier. No data was sent anywhere.
            </p>
            <Link
              to="/pricing"
              className="mt-4 inline-block rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-navy"
            >
              Compare premium plans
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className="text-sm font-medium">
                  {f.label}
                </label>
                <input
                  id={f.key}
                  type={f.type}
                  value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                />
                {errors[f.key] ? <p className="mt-1 text-sm text-down">{errors[f.key]}</p> : null}
              </div>
            ))}
            <button
              type="submit"
              className="w-full rounded-sm bg-navy px-4 py-2.5 text-sm font-medium text-background hover:bg-accent"
            >
              Create account
            </button>
          </form>
        )}
      </div>
    </SiteShell>
  );
}
