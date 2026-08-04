import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";

export function NewsletterSignup({ variant = "compact" }: { variant?: "compact" | "large" }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setDone(true);
  }

  const large = variant === "large";

  return (
    <div className={large ? "rounded-md border border-border bg-card p-6" : ""}>
      <h3 className={`font-serif text-navy ${large ? "text-2xl" : "text-lg"}`}>
        The morning brief
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Politics, markets and security, in your inbox before 7am WAT.
      </p>
      {done ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-sm border border-border bg-muted px-3 py-2 text-sm text-foreground">
          <Check className="h-4 w-4 text-accent" strokeWidth={2} />
          You are subscribed. Check your inbox to confirm.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            aria-label="Email address"
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-navy"
          >
            Subscribe
          </button>
        </form>
      )}
      {error ? <p className="mt-2 text-sm text-down">{error}</p> : null}
    </div>
  );
}
