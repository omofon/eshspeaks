"use client";

import { useEffect, useRef } from "react";
import { X, ImagePlus, Lock, Unlock, History } from "lucide-react";
import type { Section } from "@/lib/data/types";
import type { ContentTier, DraftState, RevisionEntry } from "./types";

export type SettingsSection = "image" | "title" | "taxonomy" | "tier" | "history";

interface StorySettingsDrawerProps {
  open: boolean;
  focusSection: SettingsSection;
  draft: DraftState;
  sections: Section[];
  revisions: RevisionEntry[];
  onClose: () => void;
  onChange: (patch: Partial<DraftState>) => void;
}

export function StorySettingsDrawer({
  open,
  focusSection,
  draft,
  sections,
  revisions,
  onClose,
  onChange,
}: StorySettingsDrawerProps) {
  const refs = {
    image: useRef<HTMLDivElement>(null),
    title: useRef<HTMLDivElement>(null),
    taxonomy: useRef<HTMLDivElement>(null),
    tier: useRef<HTMLDivElement>(null),
    history: useRef<HTMLDivElement>(null),
  } as const;

  useEffect(() => {
    if (open) refs[focusSection].current?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, focusSection]);

  if (!open) return null;

  const activeSection = sections.find((s) => s.slug === draft.section);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--navy-deep)]/30" onClick={onClose} />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l"
        style={{ background: "var(--background-soft)", borderColor: "var(--rule)" }}
      >
        <header className="hairline flex items-center justify-between px-5 py-4">
          <h2 className="headline-sm">Story settings</h2>
          <button type="button" aria-label="Close story settings" onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--navy)]">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Featured image */}
          <section ref={refs.image} className="mb-8">
            <p className="kicker-muted mb-3">Featured image</p>
            {draft.featuredImage ? (
              <div className="media-frame mb-3 aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.featuredImage.src} alt={draft.featuredImage.alt} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className="mb-3 flex aspect-[16/9] items-center justify-center rounded-md border border-dashed text-sm text-[var(--text-muted)]"
                style={{ borderColor: "var(--rule)" }}
              >
                No image selected
              </div>
            )}
            <label className="btn-ghost inline-flex cursor-pointer text-xs">
              <ImagePlus size={14} className="mr-1.5" />
              {draft.featuredImage ? "Replace image" : "Choose image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const src = URL.createObjectURL(file);
                  onChange({ featuredImage: { src, alt: draft.title || file.name, credit: "" } });
                  e.target.value = "";
                }}
              />
            </label>
            {draft.featuredImage ? (
              <input
                value={draft.featuredImage.alt}
                onChange={(e) => onChange({ featuredImage: { ...draft.featuredImage!, alt: e.target.value } })}
                placeholder="Describe the image for readers using a screen reader"
                className="mt-3 w-full rounded border px-2 py-1.5 text-sm outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            ) : null}
          </section>

          {/* Title & subtitle */}
          <section ref={refs.title} className="mb-8">
            <p className="kicker-muted mb-3">Display title &amp; subtitle</p>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Title</label>
            <input
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="mb-3 w-full rounded border px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Subtitle (dek)</label>
            <textarea
              value={draft.dek}
              onChange={(e) => onChange({ dek: e.target.value })}
              rows={3}
              placeholder="One or two sentences that pull a reader into the story"
              className="w-full resize-none rounded border px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
          </section>

          {/* Section / subsegment / tags */}
          <section ref={refs.taxonomy} className="mb-8">
            <p className="kicker-muted mb-3">Section &amp; tags</p>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Section</label>
            <select
              value={draft.section}
              onChange={(e) => onChange({ section: e.target.value, subsegment: "" })}
              className="mb-3 w-full rounded border bg-[var(--card)] px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="">Choose a section&hellip;</option>
              {sections.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs text-[var(--text-muted)]">Subsegment</label>
            <select
              value={draft.subsegment}
              onChange={(e) => onChange({ subsegment: e.target.value })}
              disabled={!activeSection}
              className="mb-3 w-full rounded border bg-[var(--card)] px-2 py-1.5 text-sm outline-none disabled:opacity-50"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="">Choose a subsegment&hellip;</option>
              {activeSection?.subsegments.map((sub) => (
                <option key={sub.slug} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs text-[var(--text-muted)]">Sector tags</label>
            <TagInput tags={draft.sectorTags} onChange={(sectorTags) => onChange({ sectorTags })} />
          </section>

          {/* Content tier */}
          <section ref={refs.tier} className="mb-8">
            <p className="kicker-muted mb-3">Content tier</p>
            <div className="flex gap-2">
              <TierOption
                active={draft.contentTier === "free"}
                icon={<Unlock size={14} />}
                label="Free"
                description="Open to every reader"
                onClick={() => onChange({ contentTier: "free" as ContentTier })}
              />
              <TierOption
                active={draft.contentTier === "premium"}
                icon={<Lock size={14} />}
                label="Premium"
                description="Subscribers only"
                onClick={() => onChange({ contentTier: "premium" as ContentTier })}
              />
            </div>
          </section>

          {/* Revision history */}
          <section ref={refs.history} className="mb-4">
            <p className="kicker-muted mb-3">Revision history</p>
            {revisions.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                Nothing saved yet — revisions appear here once autosave runs.
              </p>
            ) : (
              <ul className="space-y-3">
                {revisions.map((rev) => (
                  <li key={rev.id} className="flex items-start gap-2 text-sm">
                    <History size={14} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-[var(--text-primary)]">{rev.summary}</p>
                      <p className="meta mt-0.5">
                        {rev.author} · {rev.savedAt}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}

function TierOption({
  active,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-md border px-3 py-2.5 text-left transition-colors"
      style={{
        borderColor: active ? "var(--navy)" : "var(--border)",
        background: active ? "var(--navy-tint)" : "var(--card)",
      }}
    >
      <span className="mb-1 flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--navy)" }}>
        {icon}
        {label}
      </span>
      <span className="block text-xs text-[var(--text-muted)]">{description}</span>
    </button>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded border px-2 py-1.5" style={{ borderColor: "var(--border)" }}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
          style={{ background: "var(--accent-soft)", color: "var(--accent-hover)" }}
        >
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(tags.filter((t) => t !== tag))}>
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        placeholder={tags.length ? "" : "Type a tag and press Enter"}
        className="min-w-[8ch] flex-1 bg-transparent text-xs outline-none"
        onKeyDown={(e) => {
          const target = e.currentTarget;
          if (e.key === "Enter" && target.value.trim()) {
            e.preventDefault();
            const next = target.value.trim().toLowerCase();
            if (!tags.includes(next)) onChange([...tags, next]);
            target.value = "";
          }
        }}
      />
    </div>
  );
}
