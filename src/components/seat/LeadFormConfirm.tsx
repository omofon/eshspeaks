import Link from "next/link";
import { Check } from "lucide-react";

export function LeadFormConfirm({
  accent,
  title,
  description,
  backHref,
  backLabel,
}: {
  accent: string;
  title: string;
  description: string;
  backHref: `/${string}`;
  backLabel: string;
}) {
  return (
    <div className="py-16 text-center">
      <div
        className="mx-auto mb-4.5 flex h-[70px] w-[70px] items-center justify-center rounded-full"
        style={{ background: accent }}
      >
        <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
      </div>
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-[14.5px] text-ink-soft">{description}</p>
      <Link href={backHref} className="btn-ghost mt-6 inline-flex">
        {backLabel}
      </Link>
    </div>
  );
}
