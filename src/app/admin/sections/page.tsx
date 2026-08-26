"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useSectionsCatalog, SECTIONS_QUERY_KEY } from "@/hooks/useSectionsCatalog";
import {
  createSection,
  updateSection,
  deleteSection,
  createSubsegment,
  updateSubsegment,
  deleteSubsegment,
  SectionsApiError,
} from "@/lib/api/sections";
import { slugify } from "@/lib/cms/slugify";
import { TableSkeleton } from "@/components/skeletons";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteTarget =
  | { kind: "section"; slug: string; name: string }
  | { kind: "subsegment"; sectionSlug: string; slug: string; name: string };

/**
 * Chief Editor only — same gate pattern as /admin/roles. Section structure
 * is shared, cached data (see useSectionsCatalog / SECTIONS_QUERY_KEY), so
 * every mutation here invalidates that cache afterward — otherwise this
 * page's own edits wouldn't show up in the header nav until a hard reload.
 */
export default function SectionsAdminPage() {
  const { status: authStatus, role: myRole } = useAuth();
  const { sections, loading } = useSectionsCatalog();
  const queryClient = useQueryClient();
  const permitted = myRole === "chief_editor";

  const [error, setError] = useState<string | null>(null);
  const [creatingSection, setCreatingSection] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [addingSubsegmentTo, setAddingSubsegmentTo] = useState<string | null>(null);
  const [editingSubsegment, setEditingSubsegment] = useState<{
    section: string;
    slug: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEY });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setDeleteError(null);
    try {
      if (deleteTarget.kind === "section") {
        await deleteSection(deleteTarget.slug);
      } else {
        await deleteSubsegment(deleteTarget.sectionSlug, deleteTarget.slug);
      }
      await invalidate();
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(
        e instanceof SectionsApiError ? e.message : `Couldn't delete this ${deleteTarget.kind}.`,
      );
    } finally {
      setBusy(false);
    }
  }

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Checking your newsroom access…</p>
      </div>
    );
  }

  if (!permitted) {
    return (
      <div className="container-eshspeaks py-16 text-center">
        <h1 className="headline-sm" style={{ color: "var(--navy)" }}>
          Not available
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Section management is limited to the Chief Editor.
        </p>
        <Link
          href="/admin/articles"
          className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
        >
          Back to the CMS
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
      <header className="hairline sticky top-0 z-10" style={{ background: "var(--background)" }}>
        <div className="container-eshspeaks flex h-16 items-center justify-between">
          <h1 className="headline-sm" style={{ color: "var(--navy)" }}>
            Sections
          </h1>
          {!creatingSection ? (
            <button
              type="button"
              onClick={() => setCreatingSection(true)}
              className="btn-accent inline-flex items-center gap-1.5"
            >
              <Plus size={15} />
              New section
            </button>
          ) : null}
        </div>
      </header>

      <div className="container-eshspeaks pt-6">
        {error ? (
          <p
            className="mb-4 rounded-md border px-4 py-3 text-sm"
            style={{ borderColor: "var(--error)", color: "var(--error)" }}
          >
            {error}
          </p>
        ) : null}

        {creatingSection ? (
          <SectionForm
            onCancel={() => setCreatingSection(false)}
            onSubmit={async (values) => {
              setBusy(true);
              setError(null);
              try {
                await createSection(values);
                await invalidate();
                setCreatingSection(false);
              } catch (e) {
                setError(e instanceof SectionsApiError ? e.message : "Couldn't create section.");
              } finally {
                setBusy(false);
              }
            }}
            busy={busy}
          />
        ) : null}

        {loading ? (
          <div className="mt-6">
            <TableSkeleton rows={4} columns={3} />
          </div>
        ) : sections.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--text-secondary)]">No sections yet.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {sections.map((section) => (
              <li
                key={section.id}
                className="rounded-md border p-4"
                style={{ borderColor: "var(--border)" }}
              >
                {editingSection === section.slug ? (
                  <SectionForm
                    initial={{
                      name: section.name,
                      slug: section.slug,
                      isSponsored: section.isSponsored,
                    }}
                    onCancel={() => setEditingSection(null)}
                    busy={busy}
                    onSubmit={async (values) => {
                      setBusy(true);
                      setError(null);
                      try {
                        await updateSection(section.slug, values);
                        await invalidate();
                        setEditingSection(null);
                      } catch (e) {
                        setError(
                          e instanceof SectionsApiError ? e.message : "Couldn't update section.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                        {section.name}
                        {section.isSponsored ? (
                          <span className="ml-2 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                            Sponsored
                          </span>
                        ) : null}
                      </p>
                      <p className="meta mt-0.5">/{section.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingSection(section.slug)}
                        className="inline-flex items-center gap-1 rounded-sm border px-2.5 py-1.5 text-xs font-medium"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "section",
                            slug: section.slug,
                            name: section.name,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-sm border px-2.5 py-1.5 text-xs font-medium hover:border-[var(--error)] hover:text-[var(--error)]"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                  <p className="kicker-muted mb-2">Subsegments</p>
                  <ul className="space-y-2">
                    {section.subsegments.map((sub) =>
                      editingSubsegment?.section === section.slug &&
                      editingSubsegment.slug === sub.slug ? (
                        <li key={sub.id}>
                          <SubsegmentForm
                            initial={{ name: sub.name, slug: sub.slug }}
                            busy={busy}
                            onCancel={() => setEditingSubsegment(null)}
                            onSubmit={async (values) => {
                              setBusy(true);
                              setError(null);
                              try {
                                await updateSubsegment(section.slug, sub.slug, values);
                                await invalidate();
                                setEditingSubsegment(null);
                              } catch (e) {
                                setError(
                                  e instanceof SectionsApiError
                                    ? e.message
                                    : "Couldn't update subsegment.",
                                );
                              } finally {
                                setBusy(false);
                              }
                            }}
                          />
                        </li>
                      ) : (
                        <li
                          key={sub.id}
                          className="flex items-center justify-between gap-3 rounded-sm px-2 py-1.5"
                          style={{ background: "var(--card)" }}
                        >
                          <div>
                            <span className="text-sm" style={{ color: "var(--navy)" }}>
                              {sub.name}
                            </span>
                            <span className="meta ml-2">/{sub.slug}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingSubsegment({ section: section.slug, slug: sub.slug })
                              }
                              aria-label={`Edit ${sub.name}`}
                              className="p-1 text-[var(--text-secondary)] hover:text-[var(--navy)]"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  kind: "subsegment",
                                  sectionSlug: section.slug,
                                  slug: sub.slug,
                                  name: sub.name,
                                })
                              }
                              aria-label={`Delete ${sub.name}`}
                              className="p-1 text-[var(--text-secondary)] hover:text-[var(--error)]"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>

                  {addingSubsegmentTo === section.slug ? (
                    <div className="mt-2">
                      <SubsegmentForm
                        busy={busy}
                        onCancel={() => setAddingSubsegmentTo(null)}
                        onSubmit={async (values) => {
                          setBusy(true);
                          setError(null);
                          try {
                            await createSubsegment(section.slug, values);
                            await invalidate();
                            setAddingSubsegmentTo(null);
                          } catch (e) {
                            setError(
                              e instanceof SectionsApiError
                                ? e.message
                                : "Couldn't create subsegment.",
                            );
                          } finally {
                            setBusy(false);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingSubsegmentTo(section.slug)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
                      style={{ color: "var(--accent)" }}
                    >
                      <Plus size={13} />
                      Add subsegment
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&rsquo;t be undone. The backend refuses this if{" "}
              {deleteTarget?.kind === "section" ? "the section" : "the subsegment"} still holds
              published stories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? <p className="text-sm text-[var(--error)]">{deleteError}</p> : null}
          <AlertDialogFooter>
            <button
              type="button"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
              disabled={busy}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--error)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SectionForm({
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  initial?: { name: string; slug: string; isSponsored: boolean };
  onSubmit: (values: { name: string; slug: string; isSponsored: boolean }) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [isSponsored, setIsSponsored] = useState(initial?.isSponsored ?? false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    onSubmit({ name: name.trim(), slug: slug.trim(), isSponsored });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-wrap items-end gap-3 rounded-md border p-4"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="min-w-[180px] flex-1">
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
          className="mt-1 w-full rounded border bg-[var(--background)] px-2.5 py-1.5 text-sm"
          style={{ borderColor: "var(--border)" }}
        />
      </div>
      <div className="min-w-[160px] flex-1">
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Slug
        </label>
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          required
          className="mt-1 w-full rounded border bg-[var(--background)] px-2.5 py-1.5 text-sm font-mono"
          style={{ borderColor: "var(--border)" }}
        />
      </div>
      <label
        className="mb-2 flex items-center gap-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <input
          type="checkbox"
          checked={isSponsored}
          onChange={(e) => setIsSponsored(e.target.checked)}
        />
        Sponsored
      </label>
      <div className="mb-0.5 flex items-center gap-2">
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? "Saving…" : initial ? "Save" : "Create"}
        </button>
        <button type="button" onClick={onCancel} className="p-2 text-[var(--text-secondary)]">
          <X size={16} />
        </button>
      </div>
    </form>
  );
}

function SubsegmentForm({
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  initial?: { name: string; slug: string };
  onSubmit: (values: { name: string; slug: string }) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    onSubmit({ name: name.trim(), slug: slug.trim() });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-sm border p-2.5"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <input
        autoFocus
        placeholder="Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!slugTouched) setSlug(slugify(e.target.value));
        }}
        required
        className="min-w-[140px] flex-1 rounded border bg-[var(--background)] px-2 py-1 text-sm"
        style={{ borderColor: "var(--border)" }}
      />
      <input
        placeholder="slug"
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(slugify(e.target.value));
        }}
        required
        className="min-w-[120px] flex-1 rounded border bg-[var(--background)] px-2 py-1 text-sm font-mono"
        style={{ borderColor: "var(--border)" }}
      />
      <button type="submit" disabled={busy} className="btn-accent px-3 py-1 text-xs">
        {busy ? "…" : initial ? "Save" : "Add"}
      </button>
      <button type="button" onClick={onCancel} className="p-1.5 text-[var(--text-secondary)]">
        <X size={14} />
      </button>
    </form>
  );
}
