import type { ReactNode } from "react";

export function SectionHeading({
  dot,
  chipLabel,
  title,
  note,
  inverted = false,
}: {
  dot: string;
  chipLabel: string;
  title: ReactNode;
  note?: ReactNode;
  inverted?: boolean;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-6 sm:mb-9">
      <div>
        <span className={inverted ? "chip border-white/20 bg-white/10 text-white" : "chip"}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: dot }} />
          {chipLabel}
        </span>
        <h2
          className={`mt-3 text-[26px] leading-[1.1] font-semibold sm:text-[32px] ${
            inverted ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </div>
      {note ? (
        <p
          className={`max-w-[320px] text-[14.5px] ${inverted ? "text-white/55" : "text-ink-soft"}`}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}
