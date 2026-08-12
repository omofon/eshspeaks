import Link from "next/link";
import type { ReactNode } from "react";
import { WhiteLogo } from "@/components/layout/whiteLogo";

/**
 * Auth-specific shell that intentionally avoids the public newsroom chrome.
 * It uses a distinct editorial login layout with a dark backdrop and centered card.
 */
export function AuthShell({
  kicker,
  title,
  description,
  children,
  footer,
}: {
  kicker?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#0e1d3b] text-white">
      <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col px-4 py-4 sm:px-8 lg:px-[170px] lg:py-0">
        <header className="flex justify-center pb-8 pt-8 sm:pb-10 sm:pt-12">
          <WhiteLogo size="lg" inverted className="w-full max-w-[280px]" />
        </header>

        <div className="flex flex-1 items-center justify-center pb-10">
          <section className="w-full max-w-[700px] bg-white px-5 py-8 text-navy shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:px-12 sm:py-10 lg:px-[160px] lg:py-10">
            <div className="mx-auto max-w-[375px]">
              {kicker ? (
                <p className="text-center text-[12px] font-medium uppercase tracking-[0.16em] text-accent">
                  {kicker}
                </p>
              ) : null}

              <h1 className="mt-5 text-center font-serif text-[28px] leading-[1.12] tracking-[-0.04em] text-navy sm:text-[32px]">
                {title}
              </h1>

              {description ? (
                <div className="mt-4 text-center text-[14px] leading-6 text-text-secondary">
                  {description}
                </div>
              ) : null}

              <div className="mt-8">{children}</div>
            </div>
          </section>
        </div>

        {footer ? <div className="mx-auto w-full max-w-[700px] pb-8 pt-2">{footer}</div> : null}

        <footer className="mx-auto w-full max-w-[1100px] border-t border-white/20 pt-6 pb-8 text-[12px] text-white/75">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Use
            </Link>
            <span className="text-white/40">|</span>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Notice
            </Link>
            <span className="text-white/40">|</span>
            <Link href="/cookies" className="transition-colors hover:text-white">
              Cookie Policy
            </Link>
            <span className="text-white/40">|</span>
            <Link href="/accessibility" className="transition-colors hover:text-white">
              Accessibility
            </Link>
          </div>

          <p className="mt-4 text-center text-[11px] uppercase tracking-[0.12em] text-white/60">
            &copy; {new Date().getFullYear()} EshSpeaks Media. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default AuthShell;
