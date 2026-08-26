"use client";

import { useState } from "react";
import { Check, Facebook, Link2, Linkedin, MessageSquare, Share2, ThumbsUp } from "lucide-react";
import { useArticleLike } from "@/hooks/useArticleLike";
import { useAuthGatedAction } from "@/lib/auth/useAuthGatedAction";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export interface EngagementBarProps {
  articleId: string;
  initialLiked: boolean;
  likes: number;
  comments: number;
  /** Canonical, absolute URL for this article — used for every share target. */
  shareUrl: string;
  shareTitle: string;
}

/**
 * Real backend integration for likes (POST /articles/:id/like — 1 like per
 * account per article, backend-enforced) and share (client-side only; the
 * backend exposes no share/analytics endpoint, confirmed against the live
 * OpenAPI spec, so nothing is invented here). Comment count links to the
 * real thread below.
 */
export function EngagementBar({
  articleId,
  initialLiked,
  likes,
  comments,
  shareUrl,
  shareTitle,
}: EngagementBarProps) {
  const { liked, count, pending, error, toggle } = useArticleLike(articleId, initialLiked, likes);
  const runOrRedirectToLogin = useAuthGatedAction("like");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useOutsideClick<HTMLDivElement>(() => setShareOpen(false));

  async function nativeShare(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.share) return false;
    try {
      await navigator.share({ title: shareTitle, url: shareUrl });
      return true;
    } catch {
      return false; // user cancelled — not an error
    }
  }

  async function copyLink() {
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const shareLinks = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
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

  return (
    <div className="relative mt-8 flex flex-wrap items-center gap-2 border-y border-rule py-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => runOrRedirectToLogin(toggle)}
        aria-pressed={liked}
        className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          liked
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border text-foreground hover:border-navy"
        }`}
      >
        <ThumbsUp className="h-4 w-4" strokeWidth={1.75} />
        {count}
      </button>

      <div ref={shareRef} className="relative">
        <button
          type="button"
          onClick={async () => {
            const shared = await nativeShare();
            if (!shared) setShareOpen((v) => !v);
          }}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm transition-colors hover:border-navy"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
          Share
        </button>

        {shareOpen ? (
          <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-border bg-card p-2 shadow-card">
            {shareLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShareOpen(false)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted"
              >
                {link.icon ? (
                  <link.icon className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Share2 className="h-4 w-4" strokeWidth={1.75} />
                )}
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted"
            >
              {copied ? (
                <Check className="h-4 w-4 text-accent" strokeWidth={2} />
              ) : (
                <Link2 className="h-4 w-4" strokeWidth={1.75} />
              )}
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>
        ) : null}
      </div>

      <a
        href="#comments"
        className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm transition-colors hover:border-navy"
      >
        <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
        {comments}
      </a>

      {error ? <p className="w-full text-xs text-error">{error}</p> : null}
    </div>
  );
}
