import type { Section } from "@/lib/data/types";

const tintClass: Record<string, string> = {
  politics: "text-tint-politics border-tint-politics",
  business: "text-tint-business border-tint-business",
  security: "text-tint-security border-tint-security",
  stateofplay: "text-tint-stateofplay border-tint-stateofplay",
  energy: "text-tint-energy border-tint-energy",
  law: "text-tint-law border-tint-law",
  foreign: "text-tint-foreign border-tint-foreign",
  tech: "text-tint-tech border-tint-tech",
};

export function SectionTag({ section }: { section: Section }) {
  return (
    <span
      className={`inline-flex rounded-sm border px-1.5 py-0.5 font-sans text-[11px] font-medium tracking-wide ${
        tintClass[section.tint] ?? "text-muted-foreground border-border"
      }`}
    >
      {section.name}
    </span>
  );
}
