"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronDown, MoreHorizontal, Share2, ImagePlus, Tags, SlidersHorizontal, History } from "lucide-react";

import { useAuth } from "@/lib/auth/auth";
import { sections } from "@/lib/data/sections";

import { SelectionToolbar } from "./SelectionToolbar";
import { InsertMenu } from "./InsertMenu";
import { HelperBar } from "./HelperBar";
import { StorySettingsDrawer, type SettingsSection } from "./StorySettingsDrawer";
import { useAutosave } from "./useAutosave";
import {
  bodyTextLength,
  canPublishDirectly,
  emptyDraft,
  type DraftState,
  type EditorRole,
  type RevisionEntry,
} from "./types";

const BLOCK_TAGS = new Set(["P", "DIV", "H2", "H3", "BLOCKQUOTE", "LI"]);

/**
 * TODO(sprint-2-backend): `CurrentUser` doesn't carry a newsroom role yet.
 * Until `/auth/me` returns one, fall back to the lowest-privilege role and
 * expose the dev-only switcher below so reviewers can see both button
 * states without a backend change.
 */
function useEditorRole(): [EditorRole, (role: EditorRole) => void] {
  const { user } = useAuth();
  const backendRole = (user as unknown as { role?: EditorRole } | null)?.role;
  const [role, setRole] = useState<EditorRole>(backendRole ?? "contributor");
  return [role, setRole];
}

function useOutsideClick(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

export default function ArticleEditorPage() {
  const { user } = useAuth();
  const [role, setRole] = useEditorRole();
  const [draft, setDraft] = useState<DraftState>(emptyDraft());
  const [revisions, setRevisions] = useState<RevisionEntry[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [drawer, setDrawer] = useState<{ open: boolean; focus: SettingsSection }>({
    open: false,
    focus: "image",
  });

  const bodyRef = useRef<HTMLDivElement>(null);
  const activeInsertBlock = useRef<HTMLElement | null>(null);

  const [selectionToolbar, setSelectionToolbar] = useState<{ top: number; left: number } | null>(null);
  const [insertMenu, setInsertMenu] = useState<{ top: number; left: number } | null>(null);

  const patchDraft = useCallback((patch: Partial<DraftState>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const { status, lastSavedAt } = useAutosave(draft, (id) => patchDraft({ id }));

  // Log a lightweight revision entry each time autosave completes.
  const lastLoggedStatus = useRef(status);
  useEffect(() => {
    if (status === "saved" && lastLoggedStatus.current !== "saved") {
      setRevisions((prev) =>
        [
          {
            id: `rev-${Date.now()}`,
            savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            summary: draft.title.trim() ? draft.title : "Untitled draft",
            author: user?.name ?? "You",
          },
          ...prev,
        ].slice(0, 8),
      );
    }
    lastLoggedStatus.current = status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const bodyLength = bodyTextLength(draft.bodyHtml);
  const canSubmit = draft.title.trim().length > 0 && bodyLength > 0;
  const actionLabel = canPublishDirectly(role) ? "Publish" : "Submit for review";

  /* ------------------------------------------------------------ selection */

  const syncBodyHtml = useCallback(() => {
    if (bodyRef.current) patchDraft({ bodyHtml: bodyRef.current.innerHTML });
  }, [patchDraft]);

  const closestBlock = useCallback((node: Node | null): HTMLElement | null => {
    let el: HTMLElement | null = node instanceof HTMLElement ? node : node?.parentElement ?? null;
    while (el && el !== bodyRef.current) {
      if (BLOCK_TAGS.has(el.tagName)) return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      const root = bodyRef.current;
      if (!sel || !root || sel.rangeCount === 0 || !root.contains(sel.anchorNode)) {
        setSelectionToolbar(null);
        setInsertMenu(null);
        return;
      }

      const range = sel.getRangeAt(0);

      if (!sel.isCollapsed && sel.toString().trim().length > 0) {
        const rect = range.getBoundingClientRect();
        setSelectionToolbar({ top: rect.top - 10, left: rect.left + rect.width / 2 });
        setInsertMenu(null);
        return;
      }
      setSelectionToolbar(null);

      const block = closestBlock(sel.anchorNode);
      const wholeDocEmpty = (root.textContent ?? "").trim().length === 0;

      if (block && block.textContent?.trim() === "") {
        activeInsertBlock.current = block;
        const rect = block.getBoundingClientRect();
        setInsertMenu({ top: rect.top + rect.height / 2 - 16, left: rect.left - 40 });
      } else if (!block && wholeDocEmpty) {
        activeInsertBlock.current = null;
        const rect = root.getBoundingClientRect();
        setInsertMenu({ top: rect.top, left: rect.left - 40 });
      } else {
        setInsertMenu(null);
      }
    }

    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [closestBlock]);

  /* ------------------------------------------------------------- commands */

  const wrapSelection = useCallback((tag: string, className?: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.appendChild(range.extractContents());
    range.insertNode(el);
    sel.removeAllRanges();
    const next = document.createRange();
    next.selectNodeContents(el);
    sel.addRange(next);
  }, []);

  const applyBlockFormat = useCallback((tag: "h2" | "h3" | "blockquote", className: string) => {
    document.execCommand("formatBlock", false, tag);
    const sel = window.getSelection();
    const block = closestBlock(sel?.anchorNode ?? null);
    if (block && block.tagName.toLowerCase() === tag) block.className = className;
  }, [closestBlock]);

  const insertAtActiveBlock = useCallback(
    (html: string) => {
      const root = bodyRef.current;
      if (!root) return;
      const template = document.createElement("div");
      template.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      while ((node = template.firstChild)) frag.appendChild(node);

      const target = activeInsertBlock.current;
      if (target && target.parentElement) {
        target.parentElement.insertBefore(frag, target.nextSibling);
      } else {
        root.appendChild(frag);
      }
      syncBodyHtml();
    },
    [syncBodyHtml],
  );

  const editorCommands = {
    bold: () => {
      document.execCommand("bold");
      syncBodyHtml();
    },
    italic: () => {
      document.execCommand("italic");
      syncBodyHtml();
    },
    link: (url: string) => {
      document.execCommand("createLink", false, url);
      syncBodyHtml();
    },
    heading: (level: "h2" | "h3") => {
      applyBlockFormat(level, level === "h2" ? "headline-md" : "headline-sm");
      syncBodyHtml();
    },
    quote: () => {
      applyBlockFormat("blockquote", "pull-quote");
      syncBodyHtml();
    },
    code: () => {
      wrapSelection("code", "editor-inline-code");
      syncBodyHtml();
    },
    note: (note: string) => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        wrapSelection("mark", "editor-note");
        const sel2 = window.getSelection();
        const markEl = sel2?.anchorNode?.parentElement?.closest("mark");
        if (markEl) markEl.setAttribute("data-note", note);
      }
      syncBodyHtml();
    },
  };

  const insertCommands = {
    imageFile: (file: File) => {
      const src = URL.createObjectURL(file);
      insertAtActiveBlock(
        `<figure class="editor-figure"><img src="${src}" alt="${escapeHtml(file.name)}" /><figcaption class="meta">Add a caption</figcaption></figure><p><br></p>`,
      );
    },
    imageFromLibrary: (query: string) => {
      // TODO(sprint-2-media): wire to the real media-library search once it exists.
      const src = `https://picsum.photos/seed/${encodeURIComponent(query)}/1600/900`;
      insertAtActiveBlock(
        `<figure class="editor-figure"><img src="${src}" alt="${escapeHtml(query)}" /><figcaption class="meta">${escapeHtml(query)}</figcaption></figure><p><br></p>`,
      );
    },
    video: (url: string) => {
      const embedUrl = toEmbedUrl(url);
      insertAtActiveBlock(
        `<div class="editor-embed"><iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe></div><p><br></p>`,
      );
    },
    embed: (code: string) => {
      insertAtActiveBlock(
        `<div class="editor-embed-card"><p class="meta">Embed &middot; renders on publish</p><pre>${escapeHtml(code)}</pre></div><p><br></p>`,
      );
    },
    divider: () => {
      insertAtActiveBlock(`<hr class="editor-divider" /><p><br></p>`);
    },
  };

  const statusLabel = useMemo(() => {
    if (status === "saving") return "Saving…";
    if (status === "saved") return "Saved";
    if (status === "error") return "Retrying…";
    return "Draft";
  }, [status]);

  const moreRef = useOutsideClick(() => setMoreOpen(false));

  const openDrawer = (focus: SettingsSection) => {
    setDrawer({ open: true, focus });
    setMoreOpen(false);
  };

  const copyShareLink = async () => {
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/admin/articles/editor/${draft.id ?? "draft"}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard permissions can fail silently in some embeds — no-op.
    }
    setMoreOpen(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
      {/* ------------------------------------------------------------- top bar */}
      <header className="hairline sticky top-0 z-30" style={{ background: "var(--background)" }}>
        <div className="container-eshspeaks flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="wordmark text-xl" style={{ color: "var(--navy)" }}>
              EshSpeaks
            </span>
            <StatusPill label={statusLabel} saving={status === "saving"} lastSavedAt={lastSavedAt} />
          </div>

          <div className="flex items-center gap-2">
            {process.env.NODE_ENV !== "production" ? (
              <RoleSwitcher role={role} onChange={setRole} />
            ) : null}

            <button
              type="button"
              disabled={!canSubmit}
              className="btn-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {actionLabel}
            </button>

            <div ref={moreRef} className="relative">
              <button
                type="button"
                aria-label="More options"
                onClick={() => setMoreOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--muted)]"
              >
                <MoreHorizontal size={18} />
              </button>
              {moreOpen ? (
                <div
                  className="absolute right-0 top-11 w-64 rounded-md border py-1.5 shadow-[var(--shadow-raised)]"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <MenuItem icon={<Share2 size={15} />} onClick={copyShareLink}>
                    {shareCopied ? "Link copied" : "Share draft link"}
                  </MenuItem>
                  <MenuItem icon={<ImagePlus size={15} />} onClick={() => openDrawer("image")}>
                    Change featured image
                  </MenuItem>
                  <MenuItem icon={<SlidersHorizontal size={15} />} onClick={() => openDrawer("title")}>
                    Change display title / subtitle
                  </MenuItem>
                  <MenuItem icon={<Tags size={15} />} onClick={() => openDrawer("taxonomy")}>
                    Change section / subsegment / tags
                  </MenuItem>
                  <MenuItem icon={<History size={15} />} onClick={() => openDrawer("history")}>
                    See revision history
                  </MenuItem>
                  <div className="hairline my-1" />
                  <MenuItem icon={<span className="text-xs font-semibold">$</span>} onClick={() => openDrawer("tier")}>
                    Content tier: {draft.contentTier === "premium" ? "Premium" : "Free"}
                  </MenuItem>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--muted)]"
            >
              <Bell size={18} />
            </button>

            <div
              title={`${user?.name ?? "You"} · ${roleLabel(role)}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: "var(--navy)", color: "var(--text-inverse)" }}
            >
              {initials(user?.name ?? "You")}
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- canvas */}
      <main className="container-eshspeaks">
        <div className="measure mx-auto pt-16">
          <AutoResizeTitle value={draft.title} onChange={(title) => patchDraft({ title })} />

          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Tell your story…"
            className="editor-body body-editorial mt-6 min-h-[50vh] outline-none"
            onInput={syncBodyHtml}
            onBlur={syncBodyHtml}
          />
        </div>
      </main>

      {selectionToolbar ? (
        <SelectionToolbar
          top={selectionToolbar.top}
          left={selectionToolbar.left}
          onBold={editorCommands.bold}
          onItalic={editorCommands.italic}
          onLink={editorCommands.link}
          onHeading={editorCommands.heading}
          onQuote={editorCommands.quote}
          onCode={editorCommands.code}
          onNote={editorCommands.note}
        />
      ) : null}

      {insertMenu && !selectionToolbar ? (
        <InsertMenu
          top={insertMenu.top}
          left={insertMenu.left}
          onInsertImageFile={insertCommands.imageFile}
          onInsertImageFromLibrary={insertCommands.imageFromLibrary}
          onInsertVideo={insertCommands.video}
          onInsertEmbed={insertCommands.embed}
          onInsertDivider={insertCommands.divider}
        />
      ) : null}

      <StorySettingsDrawer
        open={drawer.open}
        focusSection={drawer.focus}
        draft={draft}
        sections={sections}
        revisions={revisions}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        onChange={patchDraft}
      />

      <HelperBar />

      {/* Editor-scoped typography for content that execCommand inserts raw,
          layered on top of the shared design tokens rather than duplicating them.
          Plain <style> (not styled-jsx) so this has no extra build dependency. */}
      <style>{`
        .editor-body:empty:before,
        .editor-body p:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          opacity: 0.55;
          pointer-events: none;
        }
        .editor-body h2 {
          margin: 2rem 0 0.75rem;
        }
        .editor-body h3 {
          margin: 1.5rem 0 0.5rem;
        }
        .editor-body blockquote.pull-quote {
          margin: 2rem 0;
        }
        .editor-body p {
          margin: 0 0 1.25rem;
        }
        .editor-body a {
          color: var(--accent);
          text-decoration: underline;
          text-decoration-color: var(--accent-soft);
          text-underline-offset: 2px;
        }
        .editor-inline-code {
          font-family: var(--font-mono);
          font-size: 0.875em;
          background: var(--muted);
          color: var(--navy);
          padding: 0.1em 0.4em;
          border-radius: var(--radius-sm);
        }
        .editor-note {
          background: var(--accent-soft);
          border-bottom: 1px dotted var(--accent);
        }
        .editor-figure {
          margin: 2rem 0;
        }
        .editor-figure img {
          width: 100%;
          border-radius: var(--radius-md);
        }
        .editor-divider {
          margin: 2.5rem 0;
          border: none;
          border-top: 1px solid var(--rule);
        }
        .editor-embed,
        .editor-embed-card {
          margin: 2rem 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .editor-embed iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          border: none;
          display: block;
        }
        .editor-embed-card {
          padding: 1rem;
          background: var(--muted);
        }
        .editor-embed-card pre {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          white-space: pre-wrap;
          word-break: break-word;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------------------- subparts */

function AutoResizeTitle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Title"
      className="w-full resize-none border-none bg-transparent font-serif text-4xl font-medium leading-tight outline-none placeholder:text-[var(--text-muted)]/40 lg:text-5xl"
      style={{ color: "var(--navy)" }}
    />
  );
}

function StatusPill({
  label,
  saving,
  lastSavedAt,
}: {
  label: string;
  saving: boolean;
  lastSavedAt: Date | null;
}) {
  return (
    <div className="meta flex items-center gap-1.5" title={lastSavedAt ? `Last saved ${lastSavedAt.toLocaleTimeString()}` : undefined}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${saving ? "animate-pulse" : ""}`}
        style={{ background: saving ? "var(--accent)" : "var(--success)" }}
      />
      {label}
    </div>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--muted)]"
    >
      <span className="text-[var(--text-muted)]">{icon}</span>
      {children}
    </button>
  );
}

function RoleSwitcher({ role, onChange }: { role: EditorRole; onChange: (r: EditorRole) => void }) {
  return (
    <div className="relative">
      <select
        value={role}
        onChange={(e) => onChange(e.target.value as EditorRole)}
        title="Dev-only: preview button state per role"
        className="meta appearance-none rounded border bg-transparent py-1 pl-2 pr-6 text-[10px]"
        style={{ borderColor: "var(--border)" }}
      >
        <option value="contributor">Contributor</option>
        <option value="state-correspondent">State correspondent</option>
        <option value="section-lead">Section lead</option>
        <option value="chief-editor">Chief editor</option>
      </select>
      <ChevronDown size={11} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
    </div>
  );
}

/* ----------------------------------------------------------------- utils */

function roleLabel(role: EditorRole) {
  return { contributor: "Contributor", "state-correspondent": "State correspondent", "section-lead": "Section lead", "chief-editor": "Chief editor" }[role];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function toEmbedUrl(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}
