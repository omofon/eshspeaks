"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  Facebook,
  Link2,
  Linkedin,
  MessageSquare,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useArticleLike } from "@/hooks/useArticleLike";
import { recordShare } from "@/lib/api/articles";
import { useAuthGatedAction } from "@/lib/auth/useAuthGatedAction";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { formatCompact, cn } from "@/lib/utils";

export interface EngagementBarProps {
  articleId: string;
  initialLiked: boolean;
  likes: number;
  comments: number;
  /** Canonical, absolute URL for this article, used for every share target. */
  shareUrl: string;
  shareTitle: string;
  views?: number | undefined;
}

const SAVED_KEY = "esh.saved";

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch {
    /* private mode / quota — a local bookmark is not worth surfacing an error */
  }
}

/**
 * Live likes (`POST /articles/:id/like`, one per account, backend-enforced)
 * and share-tap logging (`POST /articles/:id/share`, fire-and-forget).
 * "Save" is a local bookmark in `localStorage` (no backend endpoint yet).
 *
 * Renders the inline bar plus a floating sticky bar that slides in once the
 * inline one has scrolled above the viewport, both driven by the same like
 * state. Motion respects `prefers-reduced-motion` via the global reset.
 */
export function EngagementBar({
  articleId,
  initialLiked,
  likes,
  comments,
  shareUrl,
  shareTitle,
  views,
}: EngagementBarProps) {
  const { liked, count, pending, error, toggle } = useArticleLike(articleId, initialLiked, likes);
  const runOrRedirectToLogin = useAuthGatedAction("like");

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(0);
  const [stuck, setStuck] = useState(false);

  const shareRef = useOutsideClick<HTMLDivElement>(() => setShareOpen(false));
  const inlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaved(readSaved().includes(articleId));
  }, [articleId]);

  // Reveal the sticky bar only once the inline bar has scrolled above the
  // viewport (not while it, or the area below the article, is on screen).
  useEffect(() => {
    const el = inlineRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const belowFold = entry.boundingClientRect.top > 0;
        setStuck(!entry.isIntersecting && !belowFold);
      },
      { rootMargin: "-120px 0px 0px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function like() {
    if (!liked) setBurst((n) => n + 1);
    runOrRedirectToLogin(toggle);
  }

  function toggleSave() {
    setSaved((was) => {
      const next = was ? readSaved().filter((id) => id !== articleId) : [...readSaved(), articleId];
      writeSaved(next);
      return !was;
    });
  }

  function logShare(channel: string) {
    void recordShare(articleId, channel).catch(() => {});
  }

  async function nativeShare(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.share) return false;
    try {
      await navigator.share({ title: shareTitle, url: shareUrl });
      logShare("native");
      return true;
    } catch {
      return false; // user cancelled
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(shareUrl);
    } catch {
      /* ignore */
    }
    logShare("copy");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const shareLinks = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: Share2,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: Share2,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin,
    },
  ];

  const pillBase =
    "inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-[13px] font-semibold transition-[transform,background-color,border-color,color] duration-150 active:scale-95";
  const pillIdle = "border-ink text-ink bg-white hover:-translate-y-0.5";

  const likeButton = (
    <button
      type="button"
      disabled={pending}
      onClick={like}
      aria-pressed={liked}
      aria-label={liked ? "Remove like" : "Like this story"}
      className={cn(
        pillBase,
        "disabled:cursor-not-allowed disabled:opacity-60",
        liked ? "border-orange bg-[var(--orange-liked)] text-ink" : pillIdle,
      )}
    >
      <span className="relative grid place-items-center">
        {burst > 0 ? (
          <span
            key={burst}
            aria-hidden="true"
            className="animate-burst pointer-events-none absolute h-6 w-6 rounded-full border-2 border-accent"
          />
        ) : null}
        <ThumbsUp
          key={`${liked}-${burst}`}
          className={cn("size-4", liked && "animate-pop fill-accent")}
          strokeWidth={1.75}
        />
      </span>
      <span className="overflow-hidden">
        <span key={count} className="animate-count-in inline-block">
          {formatCompact(count)}
        </span>
      </span>
    </button>
  );

  const commentButton = (
    <a href="#comments" className={cn(pillBase, pillIdle)} aria-label="Jump to comments">
      <MessageSquare className="size-4" strokeWidth={1.75} />
      <span>{formatCompact(comments)}</span>
    </a>
  );

  const shareButton = (
    <div ref={shareRef} className="relative">
      <button
        type="button"
        onClick={async () => {
          const shared = await nativeShare();
          if (!shared) setShareOpen((v) => !v);
        }}
        aria-expanded={shareOpen}
        className={cn(pillBase, pillIdle)}
      >
        <Share2 className="size-4" strokeWidth={1.75} />
        Share
      </button>

      <div
        role="menu"
        className={cn(
          "absolute left-0 z-10 mt-2 w-52 rounded-2xl border-2 border-ink bg-white p-2 shadow-[4px_4px_0_var(--ink)] transition-[opacity,transform] duration-150",
          shareOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
          stuck ? "bottom-full top-auto mb-2 mt-0 origin-bottom-left" : "top-full origin-top-left",
        )}
      >
        {shareLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              logShare(link.label.toLowerCase());
              setShareOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition-colors hover:bg-paper-2"
          >
            <link.icon className="size-4" strokeWidth={1.75} />
            {link.label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => {
            void copyLink();
            setShareOpen(false);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition-colors hover:bg-paper-2"
        >
          {copied ? (
            <Check className="size-4 text-orange" strokeWidth={2} />
          ) : (
            <Link2 className="size-4" strokeWidth={1.75} />
          )}
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={inlineRef}
        className="mt-8 flex flex-wrap items-center gap-2.5 border-y-2 border-line py-4"
      >
        {likeButton}
        {commentButton}
        {shareButton}
        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          className={cn(pillBase, saved ? "border-navy bg-navy text-text-inverse" : pillIdle)}
        >
          <Bookmark
            className={cn(
              "size-4 transition-transform duration-150",
              saved && "scale-110 fill-current",
            )}
            strokeWidth={1.75}
          />
          {saved ? "Saved" : "Save"}
        </button>
        <button type="button" onClick={copyLink} className={cn(pillBase, pillIdle)}>
          {copied ? (
            <Check className="size-4 text-accent" strokeWidth={2} />
          ) : (
            <Link2 className="size-4" strokeWidth={1.75} />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
        {typeof views === "number" ? (
          <span className="meta ml-auto hidden sm:block">{formatCompact(views)} views</span>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-xs text-error">{error}</p> : null}

      {/* Floating sticky bar, revealed once the inline bar is above the fold */}
      <div
        aria-hidden={!stuck}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] sm:bottom-6",
          stuck ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-white/95 p-1.5 shadow-[4px_4px_0_var(--ink)] backdrop-blur">
          {likeButton}
          {commentButton}
          <button
            type="button"
            onClick={copyLink}
            className={cn(pillBase, pillIdle)}
            aria-label="Copy link to this story"
          >
            {copied ? (
              <Check className="size-4 text-accent" strokeWidth={2} />
            ) : (
              <Link2 className="size-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
