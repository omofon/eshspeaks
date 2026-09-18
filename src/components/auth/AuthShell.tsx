import type { ReactNode } from "react";
import { WhiteLogo } from "@/components/layout/whiteLogo";
import AuthGallery from "@/components/auth/AuthGallery";

/**
 * Auth-specific shell that intentionally avoids the public newsroom chrome.
 * A single white card floating on a lightly gridded canvas, split into an
 * image panel (left) and the flow's form (right). Shared by /login,
 * /verify and /username so the three steps read as one screen.
 *
 * Structural classes (auth-canvas, auth-card, gallery-grid) live in
 * globals.css; color classes resolve against the shared Colouresh tokens,
 * accented with purple (this flow's hue in the section-tint system).
 */
export function AuthShell({
  kicker,
  title,
  description,
  children,
  footer,
}: {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="auth-canvas flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
      {/* Fixed width above the breakpoint so nothing inside can reflow the
          card's footprint; fluid only on small screens. */}
      <div className="w-full max-w-[400px] md:max-w-[1040px]">
        <div className="auth-card grid overflow-hidden rounded-[20px] bg-card md:grid-cols-2">
          <AuthGallery />

          {/* min-height matches the gallery panel so the card keeps one
              fixed height across /login, /verify, /username. */}
          <section className="flex min-h-[520px] flex-col justify-center px-6 py-11 text-ink sm:px-12 sm:py-14 md:min-h-[640px] lg:px-16">
            <div className="mx-auto w-full max-w-[380px]">
              <div className="flex justify-center">
                <WhiteLogo size="md" />
              </div>

              {kicker ? (
                <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.24em] text-purple-deep">
                  {kicker}
                </p>
              ) : null}

              <h1 className="mt-3 font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-ink sm:text-[40px]">
                {title}
              </h1>

              {description ? (
                <div className="mt-4 text-[14px] leading-6 text-ink-soft">{description}</div>
              ) : null}

              <div className="mt-9">{children}</div>

              {footer ? <div className="mt-8">{footer}</div> : null}
            </div>
          </section>
        </div>

        <footer className="pt-6 text-center text-[11px] uppercase tracking-[0.12em] text-ink-soft">
          &copy; {new Date().getFullYear()} Colouresh Media
        </footer>
      </div>
    </main>
  );
}

export default AuthShell;
