"use client";

import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Lock, Unlock, History } from "lucide-react";
import type { ApiSection } from "@/lib/api/sections";
import type { ApiImageUploadResult } from "@/lib/api/types";
import type { ContentTier, DraftState, RevisionEntry, SourceType } from "@/lib/cms/types";
import { slugify } from "@/lib/cms/slugify";

export type SettingsSection = "image" | "title" | "taxonomy" | "tier" | "history";

interface StorySettingsDrawerProps {
  open: boolean;
  focusSection: SettingsSection;
  draft: DraftState;
  sections: ApiSection[];
  sectionsLoading: boolean;
  revisions: RevisionEntry[];
  onClose: () => void;
  onChange: (patch: Partial<DraftState>) => void;
  onUploadImage: (file: File, alt: string) => Promise<ApiImageUploadResult | null>;
}

export function StorySettingsDrawer({
  open,
  focusSection,
  draft,
  sections,
  sectionsLoading,
  revisions,
  onClose,
  onChange,
  onUploadImage,
}: StorySettingsDrawerProps) {
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
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

  const activeSection = sections.find((s) => s.id === draft.sectionId);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--navy-deep)]/30" onClick={onClose} />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l"
        style={{ background: "var(--background-soft)", borderColor: "var(--rule)" }}
      >
        <header className="hairline flex items-center justify-between px-5 py-4">
          <h2 className="headline-sm">Story settings</h2>
          <button
            type="button"
            aria-label="Close story settings"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--navy)]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Featured image */}
          <section ref={refs.image} className="mb-8">
            <p className="kicker-muted mb-3">Featured image</p>
            {draft.featuredImageUrl ? (
              <div className="media-frame mb-3 aspect-[16/9]">
                <img
                  src={draft.featuredImageUrl}
                  alt={draft.featuredImageAlt}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div
                className="mb-3 flex aspect-[16/9] items-center justify-center rounded-md border border-dashed text-sm text-[var(--text-muted)]"
                style={{ borderColor: "var(--rule)" }}
              >
                No image selected
              </div>
            )}
            <label
              className={`btn-ghost inline-flex text-xs ${imageUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <ImagePlus size={14} className="mr-1.5" />
              {imageUploading
                ? "Uploading…"
                : draft.featuredImageUrl
                  ? "Replace image"
                  : "Choose image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={imageUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setImageUploadError(null);
                  setImageUploading(true);
                  const alt = draft.headline || file.name;
                  const result = await onUploadImage(file, alt);
                  setImageUploading(false);
                  if (!result) {
                    setImageUploadError("Couldn't upload that image. Try again.");
                    return;
                  }
                  const img = new window.Image();
                  img.onload = () => {
                    onChange({
                      featuredImageUrl: result.url,
                      featuredImagePublicId: result.publicId,
                      featuredImageAlt: alt,
                      featuredImageWidth: result.width ?? img.naturalWidth,
                      featuredImageHeight: result.height ?? img.naturalHeight,
                    });
                  };
                  img.src = result.url;
                }}
              />
            </label>
            {imageUploadError ? (
              <p className="mt-2 text-xs text-[var(--error)]">{imageUploadError}</p>
            ) : null}
            {draft.featuredImageUrl ? (
              <input
                value={draft.featuredImageAlt}
                onChange={(e) => onChange({ featuredImageAlt: e.target.value })}
                placeholder="Describe the image for readers using a screen reader"
                className="mt-3 w-full rounded border px-2 py-1.5 text-sm outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            ) : null}
          </section>

          {/* Title, subtitle, slug */}
          <section ref={refs.title} className="mb-8">
            <p className="kicker-muted mb-3">Display title, subtitle &amp; URL</p>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Title</label>
            <input
              value={draft.headline}
              onChange={(e) => onChange({ headline: e.target.value })}
              className="mb-3 w-full rounded border px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Subtitle (dek)</label>
            <textarea
              value={draft.dek}
              onChange={(e) => onChange({ dek: e.target.value })}
              rows={3}
              placeholder="One or two sentences that pull a reader into the story"
              className="mb-3 w-full resize-none rounded border px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
            <label className="mb-1 block text-xs text-[var(--text-muted)]">
              URL slug{" "}
              {draft.slugEdited ? null : <span className="text-[var(--text-muted)]">(auto)</span>}
            </label>
            <input
              value={draft.slug}
              onChange={(e) => onChange({ slug: slugify(e.target.value), slugEdited: true })}
              className="w-full rounded border px-2 py-1.5 font-mono text-xs outline-none"
              style={{ borderColor: "var(--border)" }}
            />
          </section>

          {/* Section / subsegment / tags / source type */}
          <section ref={refs.taxonomy} className="mb-8">
            <p className="kicker-muted mb-3">Section &amp; tags</p>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">
              Section{" "}
              {sectionsLoading ? (
                <span className="text-[var(--text-muted)]">(loading…)</span>
              ) : null}
            </label>
            <select
              value={draft.sectionId}
              onChange={(e) => onChange({ sectionId: e.target.value, subsegmentId: "" })}
              disabled={sectionsLoading}
              className="mb-3 w-full rounded border bg-[var(--card)] px-2 py-1.5 text-sm outline-none disabled:opacity-50"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="">Choose a section&hellip;</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs text-[var(--text-muted)]">Subsegment</label>
            <select
              value={draft.subsegmentId}
              onChange={(e) => onChange({ subsegmentId: e.target.value })}
              disabled={!activeSection}
              className="mb-3 w-full rounded border bg-[var(--card)] px-2 py-1.5 text-sm outline-none disabled:opacity-50"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="">Choose a subsegment&hellip;</option>
              {activeSection?.subsegments.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs text-[var(--text-muted)]">Sector tags</label>
            <TagInput tags={draft.sectorTags} onChange={(sectorTags) => onChange({ sectorTags })} />

            <label className="mb-1 mt-3 block text-xs text-[var(--text-muted)]">
              Source type{" "}
              <span className="text-[var(--text-muted)]">
                (only "ORIGINAL" is confirmed live — see CMS-BACKEND-REQUESTS.md)
              </span>
            </label>
            <select
              value={draft.sourceType}
              onChange={(e) => onChange({ sourceType: e.target.value as SourceType })}
              className="w-full rounded border bg-[var(--card)] px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="ORIGINAL">Original</option>
              <option value="CURATED">Curated</option>
            </select>
          </section>

          {/* Content tier */}
          <section ref={refs.tier} className="mb-8">
            <p className="kicker-muted mb-3">Content tier</p>
            <div className="flex gap-2">
              <TierOption
                active={draft.contentTier === "FREE"}
                icon={<Unlock size={14} />}
                label="Free"
                description="Open to every reader"
                onClick={() => onChange({ contentTier: "FREE" as ContentTier })}
              />
              <TierOption
                active={draft.contentTier === "PREMIUM"}
                icon={<Lock size={14} />}
                label="Premium"
                description="Subscribers only"
                onClick={() => onChange({ contentTier: "PREMIUM" as ContentTier })}
              />
            </div>

            <p className="kicker-muted mb-3 mt-6">SEO</p>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">
              Meta title (defaults to the headline)
            </label>
            <input
              value={draft.metaTitle}
              onChange={(e) => onChange({ metaTitle: e.target.value })}
              placeholder={draft.headline || "Meta title"}
              className="mb-3 w-full rounded border px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
            <label className="mb-1 block text-xs text-[var(--text-muted)]">
              Meta description (defaults to the dek)
            </label>
            <textarea
              value={draft.metaDescription}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              rows={2}
              placeholder={draft.dek || "Meta description"}
              className="mb-3 w-full resize-none rounded border px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
            <label className="mb-1 block text-xs text-[var(--text-muted)]">
              Canonical URL (leave blank unless syndicated)
            </label>
            <input
              value={draft.canonicalUrl}
              onChange={(e) => onChange({ canonicalUrl: e.target.value })}
              placeholder="https://"
              className="w-full rounded border px-2 py-1.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
          </section>

          {/* Revision history */}
          <section ref={refs.history} className="mb-4">
            <p className="kicker-muted mb-3">Revision history</p>
            <p className="mb-2 text-xs text-[var(--text-muted)]">
              Saved in this browser only — there's no server-side revision endpoint yet.
            </p>
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
      <span
        className="mb-1 flex items-center gap-1.5 text-sm font-medium"
        style={{ color: "var(--navy)" }}
      >
        {icon}
        {label}
      </span>
      <span className="block text-xs text-[var(--text-muted)]">{description}</span>
    </button>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  return (
    <div
      className="flex flex-wrap gap-1.5 rounded border px-2 py-1.5"
      style={{ borderColor: "var(--border)" }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
          style={{ background: "var(--accent-soft)", color: "var(--accent-hover)" }}
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(tags.filter((t) => t !== tag))}
          >
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
