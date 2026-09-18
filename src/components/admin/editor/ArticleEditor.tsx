"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Share2,
  ImagePlus,
  Tags,
  SlidersHorizontal,
  History,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/lib/auth/AuthProvider";
import { useAutosave } from "@/hooks/useAutosave";
import { useDraftLoader } from "@/hooks/useDraftLoader";
import { useEditorRole } from "@/hooks/useEditorRole";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useSectionsCatalog } from "@/hooks/useSectionsCatalog";
import { newLocalDraftId, deleteDraftLocal, markDraftSubmitted } from "@/lib/storage/draftStorage";
import {
  submitArticle,
  updateArticle,
  changeArticleStatus,
  deleteArticle,
  uploadArticleImage,
  ArticleApiError,
} from "@/lib/api/articles";
import {
  detectEmbedKind,
  toVideoEmbedUrl,
  fetchTwitterEmbedHtml,
  facebookEmbedMarkup,
} from "@/lib/api/oembed";
import { slugify } from "@/lib/cms/slugify";
import {
  bodyTextLength,
  canPublishDirectly,
  type ArticleStatus,
  type DraftState,
  type EditorRole,
  type RevisionEntry,
} from "@/lib/cms/types";

import { SelectionToolbar } from "./SelectionToolbar";
import { InsertMenu } from "./InsertMenu";
import { HelperBar } from "./HelperBar";
import { ReviewNotesPanel } from "@/components/admin/ReviewNotesPanel";
import { MentionMenu } from "./MentionMenu";
import { StorySettingsDrawer, type SettingsSection } from "./StorySettingsDrawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Legal status transitions, confirmed via the live ChangeArticleStatusDto
 * OpenAPI schema. Only a Section Lead or Chief Editor may reach `published`
 * or `archived` — the backend enforces that with a 403; this table is used
 * only to decide which actions to *offer*, not to authorize anything.
 */
const STATUS_TRANSITIONS: Record<
  ArticleStatus,
  { status: ArticleStatus; label: string; requiresPublishRight: boolean }[]
> = {
  draft: [
    { status: "in_review", label: "Submit for review", requiresPublishRight: false },
    { status: "published", label: "Publish", requiresPublishRight: true },
  ],
  in_review: [
    { status: "draft", label: "Return to draft", requiresPublishRight: false },
    { status: "published", label: "Publish", requiresPublishRight: true },
  ],
  published: [{ status: "archived", label: "Archive", requiresPublishRight: true }],
  archived: [
    { status: "published", label: "Republish", requiresPublishRight: true },
    { status: "draft", label: "Move back to draft", requiresPublishRight: true },
  ],
};

function availableTransitions(status: ArticleStatus, role: EditorRole) {
  return STATUS_TRANSITIONS[status].filter(
    (t) => !t.requiresPublishRight || canPublishDirectly(role),
  );
}

function articleStatusLabel(status: ArticleStatus): string {
  return { draft: "Draft", in_review: "In review", published: "Published", archived: "Archived" }[
    status
  ];
}

const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "BLOCKQUOTE", "LI"]);

export interface ArticleEditorProps {
  /** Present on /admin/articles/editor/[id]; absent on the "new story" route. */
  draftId?: string;
}

export function ArticleEditor({ draftId }: ArticleEditorProps) {
  const { user } = useAuth();
  // useEditorRole() returns a single value, not [role, setRole]. In
  // production it is always the real session role; the dev-only "preview as
  // a role" override is read internally, so this component never manages
  // role state itself. The top bar shows this role read-only, never a picker.
  const role = useEditorRole();
  const {
    draft,
    setDraft,
    loading: loadingDraft,
    error: loadError,
  } = useDraftLoader(draftId ?? null);
  const {
    sections,
    loading: loadingSections,
    error: sectionsError,
    usingMock,
  } = useSectionsCatalog();
  const [revisions, setRevisions] = useState<RevisionEntry[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [submitState, setSubmitState] = useState<{
    status: "idle" | "submitting" | "done" | "error";
    message?: string;
  }>({
    status: "idle",
  });
  const [drawer, setDrawer] = useState<{ open: boolean; focus: SettingsSection }>({
    open: false,
    focus: "image",
  });

  const bodyRef = useRef<HTMLDivElement>(null);
  const activeInsertBlock = useRef<HTMLElement | null>(null);

  const [selectionToolbar, setSelectionToolbar] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [insertMenu, setInsertMenu] = useState<{ top: number; left: number } | null>(null);
  const [mentionMenu, setMentionMenu] = useState<{
    top: number;
    left: number;
    query: string;
  } | null>(null);
  const mentionAnchor = useRef<{ node: Text; start: number; end: number } | null>(null);

  const patchDraft = useCallback(
    (patch: Partial<DraftState>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [setDraft],
  );

  // FIXED: user.name doesn't exist on CurrentUser (fields are displayName /
  // username / email). Derive a display name the same way the account page
  // does, so this doesn't silently render "undefined" in the avatar/title.
  const displayName = user?.displayName ?? user?.username ?? user?.email?.split("@")[0] ?? "You";

  // Assign a local id (and take over the URL) the moment the story has
  // real content — that's what autosave and "reopen this draft" key off,
  // since the server has nowhere to persist an in-progress edit yet.
  //
  // Uses window.history.replaceState directly, NOT next/navigation's
  // router.replace(). router.replace() here crosses from
  // app/admin/articles/editor/page.tsx to .../[id]/page.tsx — a real
  // route change — which remounts the editor mid-keystroke. A plain
  // history update changes the URL bar without triggering Next's router
  // at all, so the component instance — and your cursor — never moves.
  useEffect(() => {
    if (draft.id || loadingDraft) return;
    if (!draft.headline.trim() && !draft.body.trim()) return;
    const id = newLocalDraftId();
    patchDraft({ id });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/admin/articles/editor/${id}`);
    }
  }, [draft.id, draft.headline, draft.body, loadingDraft, patchDraft]);

  // Auto-derive the slug from the headline until the user edits it by hand.
  useEffect(() => {
    if (draft.slugEdited) return;
    const next = slugify(draft.headline);
    if (next !== draft.slug) patchDraft({ slug: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.headline, draft.slugEdited]);

  // Autosave-to-localStorage only applies to a not-yet-created draft. Once
  // remoteId is set (freshly created, or reopened from the server via
  // useDraftLoader), the server is the source of truth and "Save changes"
  // (PATCH) is the real persistence path — writing a local copy here too
  // would let a stale localStorage entry shadow the fresh server copy the
  // next time this same slug is opened.
  const { status: autosaveStatus, lastSavedAt } = useAutosave(
    draft,
    !loadingDraft && !draft.remoteId,
  );

  // Once the draft finishes loading into the DOM, seed the contentEditable
  // body from `body` — a deliberate one-time sync, not a controlled
  // render, so typing afterwards doesn't fight React.
  const seededBodyRef = useRef(false);
  useEffect(() => {
    if (loadingDraft || seededBodyRef.current || !bodyRef.current) return;
    bodyRef.current.innerHTML = draft.body;
    seededBodyRef.current = true;
  }, [loadingDraft, draft.body]);

  // Log a lightweight revision entry each time a local autosave completes.
  const lastLoggedStatus = useRef(autosaveStatus);
  useEffect(() => {
    if (autosaveStatus === "saved" && lastLoggedStatus.current !== "saved") {
      setRevisions((prev) =>
        [
          {
            id: `rev-${Date.now()}`,
            savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            summary: draft.headline.trim() ? draft.headline : "Untitled draft",
            author: displayName,
          },
          ...prev,
        ].slice(0, 8),
      );
    }
    lastLoggedStatus.current = autosaveStatus;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveStatus]);

  const router = useRouter();
  const bodyLength = bodyTextLength(draft.body);
  const canSubmit =
    draft.headline.trim().length > 0 &&
    bodyLength > 0 &&
    Boolean(draft.sectionId) &&
    Boolean(role) &&
    submitState.status !== "submitting";
  const targetStatus: ArticleStatus = role && canPublishDirectly(role) ? "published" : "in_review";
  const actionLabel = targetStatus === "published" ? "Publish" : "Submit for review";

  const [saveState, setSaveState] = useState<{
    status: "idle" | "saving" | "done" | "error";
    message?: string;
  }>({ status: "idle" });
  const [statusChange, setStatusChange] = useState<{
    status: "idle" | "changing" | "error";
    message?: string;
  }>({ status: "idle" });
  const [deleteState, setDeleteState] = useState<{
    status: "idle" | "deleting" | "error";
    message?: string;
  }>({ status: "idle" });
  const [uploadError, setUploadError] = useState<string | null>(null);

  /** First-time create + immediately move to the caller's reachable target status. */
  const handleCreate = async () => {
    setSubmitState({ status: "submitting" });
    try {
      const { id: remoteId } = await submitArticle(draft);
      if (!remoteId) {
        setSubmitState({
          status: "error",
          message:
            "The story was created, but the server didn't return an id — refresh and check the CMS list.",
        });
        return;
      }
      await changeArticleStatus(remoteId, targetStatus);
      const next: DraftState = { ...draft, remoteId, status: targetStatus };
      setDraft(next);
      if (draft.id) {
        markDraftSubmitted({
          localId: draft.id,
          remoteId,
          headline: draft.headline,
          submittedAt: new Date().toISOString(),
        });
        deleteDraftLocal(draft.id);
      }
      setSubmitState({ status: "done" });
    } catch (e) {
      const message =
        e instanceof ArticleApiError ? e.message : "Something went wrong submitting this story.";
      setSubmitState({ status: "error", message });
    }
  };

  /** PATCH content only — never touches status (the backend rejects status on this endpoint by design). */
  const handleSaveChanges = async () => {
    if (!draft.remoteId) return;
    setSaveState({ status: "saving" });
    try {
      await updateArticle(draft.remoteId, draft);
      setSaveState({ status: "done" });
      window.setTimeout(
        () => setSaveState((s) => (s.status === "done" ? { status: "idle" } : s)),
        2500,
      );
    } catch (e) {
      setSaveState({
        status: "error",
        message: e instanceof ArticleApiError ? e.message : "Couldn't save your changes.",
      });
    }
  };

  const handleStatusChange = async (next: ArticleStatus) => {
    if (!draft.remoteId) return;
    setStatusChange({ status: "changing" });
    try {
      await changeArticleStatus(draft.remoteId, next);
      patchDraft({ status: next });
      setStatusChange({ status: "idle" });
    } catch (e) {
      setStatusChange({
        status: "error",
        message: e instanceof ArticleApiError ? e.message : "Couldn't change this story's status.",
      });
    }
  };

  const handleDelete = async () => {
    if (!draft.remoteId) return;
    setDeleteState({ status: "deleting" });
    try {
      await deleteArticle(draft.remoteId);
      if (draft.id) deleteDraftLocal(draft.id);
      router.push("/admin/articles");
    } catch (e) {
      setDeleteState({
        status: "error",
        message: e instanceof ArticleApiError ? e.message : "Couldn't delete this story.",
      });
    }
  };

  async function uploadImage(file: File, alt: string) {
    setUploadError(null);
    try {
      return await uploadArticleImage(file, alt);
    } catch (e) {
      setUploadError(e instanceof ArticleApiError ? e.message : "Couldn't upload that image.");
      return null;
    }
  }

  /* ------------------------------------------------------------ selection */

  const syncBody = useCallback(() => {
    if (bodyRef.current) patchDraft({ body: bodyRef.current.innerHTML });
  }, [patchDraft]);

  // Paste as clean editorial markup. Word / Google Docs / web copy carries
  // inline `style` (its own background and text colour, fonts, sizes),
  // `class` and wrapper `<div>`/`<span>` soup — that's why pasted text used
  // to sit on a different-coloured block from the rest of the editor. Strip
  // everything except a small tag allow-list and `href`, so pasted text
  // inherits the editor's own surface and type.
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const html = e.clipboardData.getData("text/html");
      const text = e.clipboardData.getData("text/plain");
      if (html) {
        document.execCommand("insertHTML", false, cleanPastedHtml(html));
      } else if (text) {
        document.execCommand("insertText", false, text);
      }
      syncBody();
    },
    [syncBody],
  );

  const pickMention = useCallback(
    (name: string) => {
      const anchor = mentionAnchor.current;
      if (!anchor) return;
      const { node, start, end } = anchor;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      range.deleteContents();

      const span = document.createElement("span");
      span.className = "editor-mention";
      span.contentEditable = "false";
      span.textContent = `@${name}`;
      const space = document.createTextNode("\u00A0");
      const frag = document.createDocumentFragment();
      frag.appendChild(span);
      frag.appendChild(space);
      range.insertNode(frag);

      const sel = window.getSelection();
      const after = document.createRange();
      after.setStartAfter(space);
      after.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(after);

      setMentionMenu(null);
      mentionAnchor.current = null;
      syncBody();
    },
    [syncBody],
  );

  const closestBlock = useCallback((node: Node | null): HTMLElement | null => {
    let el: HTMLElement | null = node instanceof HTMLElement ? node : (node?.parentElement ?? null);
    while (el && el !== bodyRef.current) {
      if (BLOCK_TAGS.has(el.tagName)) return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  useEffect(() => {
    function onSelectionChange() {
      // The link / embed-URL / media-search / private-note popovers live
      // inside the selection toolbar and the insert menu, and each one
      // auto-focuses its input on open. That focus change fires
      // `selectionchange` with the caret no longer inside the editor body,
      // which used to immediately null the menu that owns the popover — so
      // clicking "Embed a link", "Search media library" or "Embed raw HTML"
      // looked like it did nothing. While a popover field holds focus, leave
      // the menus exactly as they are.
      if ((document.activeElement as HTMLElement | null)?.closest("[data-editor-popover]")) {
        return;
      }

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

      // @mention detection — look at the text node immediately before the caret.
      const anchorNode = sel.anchorNode;
      const anchorOffset = sel.anchorOffset;
      if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
        const text = (anchorNode as Text).data.slice(0, anchorOffset);
        const match = text.match(/@([a-zA-Z]{0,20}(?: [a-zA-Z]{0,20})?)$/);
        if (match) {
          mentionAnchor.current = {
            node: anchorNode as Text,
            start: anchorOffset - match[0].length,
            end: anchorOffset,
          };
          const rect = range.getBoundingClientRect();
          setMentionMenu({ top: rect.bottom + 6, left: rect.left, query: match[1] ?? "" });
        } else {
          setMentionMenu(null);
          mentionAnchor.current = null;
        }
      } else {
        setMentionMenu(null);
        mentionAnchor.current = null;
      }

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

  const applyBlockFormat = useCallback(
    (tag: "p" | "h1" | "h2" | "h3" | "h4" | "blockquote", className: string) => {
      document.execCommand("formatBlock", false, tag);
      const sel = window.getSelection();
      const block = closestBlock(sel?.anchorNode ?? null);
      if (block && block.tagName.toLowerCase() === tag) block.className = className;
    },
    [closestBlock],
  );

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
      syncBody();
    },
    [syncBody],
  );

  const editorCommands = {
    bold: () => {
      document.execCommand("bold");
      syncBody();
    },
    italic: () => {
      document.execCommand("italic");
      syncBody();
    },
    // ADDED — SelectionToolbar now requires these; execCommand names are
    // "underline" and "strikeThrough" (capital T), not guesses.
    underline: () => {
      document.execCommand("underline");
      syncBody();
    },
    strikethrough: () => {
      document.execCommand("strikeThrough");
      syncBody();
    },
    link: (url: string) => {
      document.execCommand("createLink", false, url);
      syncBody();
    },
    // ADDED h4. There's no dedicated "headline-xs" utility in globals.css
    // for a fourth tier — reusing headline-sm's class means H3 and H4 will
    // look visually identical for now. That's a design-system gap, not a
    // logic bug; flagging it rather than inventing a new CSS utility you
    // haven't reviewed.
    heading: (level: "h1" | "h2" | "h3" | "h4") => {
      const className =
        level === "h1" ? "headline-lg" : level === "h2" ? "headline-md" : "headline-sm";
      applyBlockFormat(level, className);
      syncBody();
    },
    quote: () => {
      applyBlockFormat("blockquote", "pull-quote");
      syncBody();
    },
    code: () => {
      wrapSelection("code", "editor-inline-code");
      syncBody();
    },
    bulletList: () => {
      document.execCommand("insertUnorderedList");
      syncBody();
    },
    numberedList: () => {
      document.execCommand("insertOrderedList");
      syncBody();
    },
    // Reset the current block to plain body text — the way back from a
    // heading or quote to normal small text.
    paragraph: () => {
      applyBlockFormat("p", "");
      syncBody();
    },
    align: (dir: "left" | "center" | "right" | "justify") => {
      const command = {
        left: "justifyLeft",
        center: "justifyCenter",
        right: "justifyRight",
        justify: "justifyFull",
      }[dir];
      document.execCommand(command);
      syncBody();
    },
    note: (note: string) => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        wrapSelection("mark", "editor-note");
        const sel2 = window.getSelection();
        const markEl = sel2?.anchorNode?.parentElement?.closest("mark");
        if (markEl) markEl.setAttribute("data-note", note);
      }
      syncBody();
    },
  };

  const insertCommands = {
    imageFile: async (file: File) => {
      const placeholderId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const previewSrc = URL.createObjectURL(file);
      insertAtActiveBlock(
        `<figure class="editor-figure" data-upload-id="${placeholderId}"><img src="${previewSrc}" alt="${escapeHtml(file.name)}" style="opacity:0.55" /><figcaption class="meta">Uploading&hellip;</figcaption></figure><p><br></p>`,
      );

      const uploaded = await uploadImage(file, file.name);
      const figure = bodyRef.current?.querySelector<HTMLElement>(
        `[data-upload-id="${placeholderId}"]`,
      );
      URL.revokeObjectURL(previewSrc);

      if (!figure) return; // block was removed/edited away before the upload finished
      if (!uploaded) {
        figure.querySelector("figcaption")!.textContent =
          "Upload failed — remove this image and try again.";
        figure.querySelector("img")?.setAttribute("style", "opacity:0.3");
      } else {
        figure.querySelector("img")?.setAttribute("src", uploaded.url);
        figure.querySelector("img")?.removeAttribute("style");
        figure.querySelector("figcaption")!.textContent = "Add a caption";
      }
      figure.removeAttribute("data-upload-id");
      syncBody();
    },
    imageFromLibrary: (query: string) => {
      const src = `https://picsum.photos/seed/${encodeURIComponent(query)}/1600/900`;
      insertAtActiveBlock(
        `<figure class="editor-figure"><img src="${src}" alt="${escapeHtml(query)}" /><figcaption class="meta">${escapeHtml(query)}</figcaption></figure><p><br></p>`,
      );
    },
    embedLink: async (url: string) => {
      const kind = detectEmbedKind(url);
      try {
        if (kind === "youtube" || kind === "vimeo") {
          insertAtActiveBlock(
            `<div class="editor-embed"><iframe src="${toVideoEmbedUrl(url)}" allowfullscreen loading="lazy"></iframe></div><p><br></p>`,
          );
        } else if (kind === "twitter") {
          const html = await fetchTwitterEmbedHtml(url);
          insertAtActiveBlock(`<div class="editor-embed-social">${html}</div><p><br></p>`);
        } else if (kind === "facebook") {
          insertAtActiveBlock(
            `<div class="editor-embed-social">${facebookEmbedMarkup(url)}<p class="meta">Facebook post &middot; renders once the Facebook SDK script is added to the app, see CMS-BACKEND-REQUESTS.md</p></div><p><br></p>`,
          );
        } else {
          insertAtActiveBlock(
            `<a class="editor-link-card" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a><p><br></p>`,
          );
        }
      } catch {
        insertAtActiveBlock(
          `<a class="editor-link-card" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a><p><br></p>`,
        );
      }
    },
    codeBlock: () => {
      insertAtActiveBlock(
        `<pre class="editor-code-block"><code contenteditable="true">// code</code></pre><p><br></p>`,
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
    if (loadingDraft) return "Loading\u2026";
    if (submitState.status === "submitting") return "Submitting\u2026";
    if (submitState.status === "done") return "Submitted";
    if (autosaveStatus === "saving") return "Saving\u2026";
    if (autosaveStatus === "saved") return "Saved in this browser";
    return "Draft";
  }, [loadingDraft, submitState.status, autosaveStatus]);

  const moreRef = useOutsideClick<HTMLDivElement>(() => setMoreOpen(false));

  const openDrawer = (focus: SettingsSection) => {
    setDrawer({ open: true, focus });
    setMoreOpen(false);
  };

  const copyShareLink = async () => {
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/admin/articles/editor/${draft.id ?? "draft"}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      // Clipboard permissions can fail silently in some embeds — no-op.
    }
    setMoreOpen(false);
  };

  // GUARD: role is null while the session is still loading, or if this
  // somehow renders for a non-editor role (shouldn't happen — the parent
  // layout already gates it server-side — but a client-side render can
  // beat the SSR check on fast client-side navigations, so this is a real
  // guard, not decoration).
  if (!role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Checking your newsroom access\u2026</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
      {/* ------------------------------------------------------------- top bar */}
      <header className="hairline sticky top-0 z-30" style={{ background: "var(--background)" }}>
        <div className="container-colouresh flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="wordmark text-xl" style={{ color: "var(--navy)" }}>
              Colouresh
            </span>
            <StatusPill
              label={statusLabel}
              saving={
                autosaveStatus === "saving" || loadingDraft || submitState.status === "submitting"
              }
              lastSavedAt={lastSavedAt}
            />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="meta rounded-full border px-2.5 py-1 text-[11px]"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              title="Your newsroom role"
            >
              {roleLabel(role)}
            </span>

            {draft.remoteId ? (
              <>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
                  style={{ background: "var(--navy-tint)", color: "var(--navy)" }}
                >
                  {articleStatusLabel(draft.status)}
                </span>
                <button
                  type="button"
                  disabled={saveState.status === "saving"}
                  onClick={handleSaveChanges}
                  className="btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saveState.status === "saving"
                    ? "Saving\u2026"
                    : saveState.status === "done"
                      ? "Saved"
                      : "Save changes"}
                </button>
                {availableTransitions(draft.status, role).map((t) => (
                  <button
                    key={t.status}
                    type="button"
                    disabled={statusChange.status === "changing"}
                    onClick={() => handleStatusChange(t.status)}
                    className="btn-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {statusChange.status === "changing" ? "Working\u2026" : t.label}
                  </button>
                ))}
              </>
            ) : (
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleCreate}
                className="btn-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitState.status === "submitting" ? "Submitting\u2026" : actionLabel}
              </button>
            )}

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
                  <MenuItem
                    icon={<SlidersHorizontal size={15} />}
                    onClick={() => openDrawer("title")}
                  >
                    Change display title / subtitle / slug
                  </MenuItem>
                  <MenuItem icon={<Tags size={15} />} onClick={() => openDrawer("taxonomy")}>
                    Change section / subsegment / tags
                  </MenuItem>
                  <MenuItem icon={<History size={15} />} onClick={() => openDrawer("history")}>
                    See revision history
                  </MenuItem>
                  <div className="hairline my-1" />
                  <MenuItem
                    icon={<span className="text-xs font-semibold">$</span>}
                    onClick={() => openDrawer("tier")}
                  >
                    Content tier: {draft.contentTier === "PREMIUM" ? "Premium" : "Free"}
                  </MenuItem>
                  {draft.remoteId && role === "chief_editor" ? (
                    <>
                      <div className="hairline my-1" />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setMoreOpen(false)}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm hover:bg-[var(--muted)]"
                            style={{ color: "var(--error)" }}
                          >
                            <Trash2 size={15} />
                            Delete story
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this story?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently deletes &ldquo;{draft.headline || "this story"}
                              &rdquo; along with its likes and comments. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              style={{ background: "var(--error)" }}
                            >
                              Delete permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div
              title={`${displayName} \u00b7 ${roleLabel(role)}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: "var(--navy)", color: "var(--text-inverse)" }}
            >
              {initials(displayName)}
            </div>
          </div>
        </div>
      </header>

      {loadError ? <Banner tone="error">{loadError}</Banner> : null}
      {sectionsError && !usingMock ? (
        <Banner tone="error">Couldn't load sections/subsegments: {sectionsError}</Banner>
      ) : null}
      {usingMock ? (
        <Banner tone="warning">
          Using local mock sections (NEXT_PUBLIC_USE_MOCK_DATA=true) — these don't have real ids, so
          submitting will fail against the live API.
        </Banner>
      ) : null}
      {submitState.status === "error" ? <Banner tone="error">{submitState.message}</Banner> : null}
      {submitState.status === "done" ? (
        <Banner tone="success">
          {targetStatus === "published" ? "Published." : "Submitted for review."}
        </Banner>
      ) : null}
      {saveState.status === "error" ? <Banner tone="error">{saveState.message}</Banner> : null}
      {statusChange.status === "error" ? (
        <Banner tone="error">{statusChange.message}</Banner>
      ) : null}
      {deleteState.status === "error" ? <Banner tone="error">{deleteState.message}</Banner> : null}
      {uploadError ? <Banner tone="error">{uploadError}</Banner> : null}

      {/* ------------------------------------------------------------- canvas */}
      <main className="container-colouresh">
        <div className="measure mx-auto pt-16">
          {loadingDraft ? (
            <EditorSkeleton />
          ) : (
            <>
              <AutoResizeTitle
                value={draft.headline}
                onChange={(headline) => patchDraft({ headline })}
              />

              {draft.remoteId ? (
                <div className="mt-5">
                  <ReviewNotesPanel articleId={draft.remoteId} />
                </div>
              ) : null}

              <div
                ref={bodyRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Tell your story\u2026"
                className="editor-body body-editorial mt-6 min-h-[50vh] outline-none"
                onInput={syncBody}
                onBlur={syncBody}
                onPaste={handlePaste}
              />
            </>
          )}
        </div>
      </main>

      {selectionToolbar ? (
        <SelectionToolbar
          top={selectionToolbar.top}
          left={selectionToolbar.left}
          onBold={editorCommands.bold}
          onItalic={editorCommands.italic}
          onUnderline={editorCommands.underline}
          onStrikethrough={editorCommands.strikethrough}
          onLink={editorCommands.link}
          onHeading={editorCommands.heading}
          onParagraph={editorCommands.paragraph}
          onQuote={editorCommands.quote}
          onCode={editorCommands.code}
          onBulletList={editorCommands.bulletList}
          onNumberedList={editorCommands.numberedList}
          onAlign={editorCommands.align}
          onNote={editorCommands.note}
        />
      ) : null}

      {insertMenu && !selectionToolbar ? (
        <InsertMenu
          top={insertMenu.top}
          left={insertMenu.left}
          onInsertImageFile={insertCommands.imageFile}
          onInsertImageFromLibrary={insertCommands.imageFromLibrary}
          onInsertEmbedLink={insertCommands.embedLink}
          onInsertCodeBlock={insertCommands.codeBlock}
          onInsertEmbed={insertCommands.embed}
          onInsertDivider={insertCommands.divider}
        />
      ) : null}

      {mentionMenu ? (
        <MentionMenu
          top={mentionMenu.top}
          left={mentionMenu.left}
          query={mentionMenu.query}
          onPick={pickMention}
        />
      ) : null}

      <StorySettingsDrawer
        open={drawer.open}
        focusSection={drawer.focus}
        draft={draft}
        sections={sections}
        sectionsLoading={loadingSections}
        revisions={revisions}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        onChange={patchDraft}
        onUploadImage={uploadImage}
      />

      <HelperBar />

      <style>{`
        .editor-body:empty:before,
        .editor-body p:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          opacity: 0.55;
          pointer-events: none;
        }
        .editor-body h1 { margin: 2.5rem 0 1rem; }
        .editor-body h2 { margin: 2rem 0 0.75rem; }
        .editor-body h3 { margin: 1.5rem 0 0.5rem; }
        .editor-body h4 { margin: 1.25rem 0 0.5rem; }
        .editor-body blockquote.pull-quote { margin: 2rem 0; }
        .editor-body p { margin: 0 0 1.25rem; }
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
        .editor-figure { margin: 2rem 0; }
        .editor-figure img { width: 100%; border-radius: var(--radius-md); }
        .editor-divider { margin: 2.5rem 0; border: none; border-top: 1px solid var(--rule); }
        .editor-embed, .editor-embed-card {
          margin: 2rem 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .editor-embed iframe { width: 100%; aspect-ratio: 16 / 9; border: none; display: block; }
        .editor-embed-card { padding: 1rem; background: var(--muted); }
        .editor-embed-card pre {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          white-space: pre-wrap;
          word-break: break-word;
          color: var(--text-secondary);
        }
        .editor-embed-social { margin: 2rem 0; display: flex; justify-content: center; }
        .editor-mention {
          background: var(--navy-tint);
          color: var(--navy);
          border-radius: var(--radius-sm);
          padding: 0.05em 0.35em;
          font-weight: 500;
        }
        .editor-code-block {
          margin: 2rem 0;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          background: var(--navy-deep);
          overflow-x: auto;
        }
        .editor-code-block code {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          line-height: 1.6;
          color: var(--text-inverse);
          outline: none;
        }
        .editor-link-card {
          display: block;
          margin: 1.5rem 0;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: var(--accent);
          word-break: break-all;
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

function EditorSkeleton() {
  return (
    <div className="animate-pulse pt-1">
      <div className="mb-6 h-11 w-3/4 rounded" style={{ background: "var(--muted)" }} />
      <div className="space-y-3">
        {[100, 100, 80, 100, 60].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded"
            style={{ background: "var(--muted)", width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "error" | "warning" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    error: { background: "var(--error-soft)", borderColor: "var(--error)", color: "var(--error)" },
    warning: {
      background: "var(--warning-soft)",
      borderColor: "var(--warning)",
      color: "var(--warning)",
    },
    success: {
      background: "var(--success-soft)",
      borderColor: "var(--success)",
      color: "var(--success)",
    },
  }[tone];
  return (
    <div className="container-colouresh pt-4">
      <div className="rounded-md border px-4 py-3 text-sm" style={styles}>
        {children}
      </div>
    </div>
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
    <div
      className="meta flex items-center gap-1.5"
      title={lastSavedAt ? `Last saved ${lastSavedAt.toLocaleTimeString()}` : undefined}
    >
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

/* ----------------------------------------------------------------- utils */

// FIXED: underscore keys to match EditorRole.
function roleLabel(role: EditorRole) {
  return {
    contributor: "Contributor",
    state_correspondent: "State correspondent",
    section_lead: "Section lead",
    chief_editor: "Chief editor",
  }[role];
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
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/**
 * Tags kept from pasted HTML. Everything else is unwrapped (its text and
 * children survive, the tag itself is dropped). Every attribute is removed
 * except `href` on an anchor — this is what stops pasted content from
 * carrying its own background colour, text colour and fonts into the body.
 */
const PASTE_ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "A",
  "H1",
  "H2",
  "H3",
  "H4",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "CODE",
  "PRE",
]);

function cleanPastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const scrub = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as HTMLElement;
      scrub(el);
      if (!PASTE_ALLOWED_TAGS.has(el.tagName)) {
        el.replaceWith(...Array.from(el.childNodes));
        continue;
      }
      for (const attr of Array.from(el.attributes)) {
        if (el.tagName === "A" && attr.name === "href") continue;
        el.removeAttribute(attr.name);
      }
    }
  };

  scrub(doc.body);
  return doc.body.innerHTML;
}
