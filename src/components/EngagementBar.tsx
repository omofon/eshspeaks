import { useState } from "react";
import { Check, Link2, MessageSquare, Share2, ThumbsUp } from "lucide-react";

export function EngagementBar({ likes, comments }: { likes: number; comments: number }) {
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative mt-8 flex items-center gap-2 border-y border-rule py-3">
      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm ${
          liked ? "border-accent bg-accent text-accent-foreground" : "border-border text-foreground hover:border-navy"
        }`}
      >
        <ThumbsUp className="h-4 w-4" strokeWidth={1.75} />
        {likes + (liked ? 1 : 0)}
      </button>

      <button
        type="button"
        onClick={() => setShareOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm hover:border-navy"
      >
        <Share2 className="h-4 w-4" strokeWidth={1.75} />
        Share
      </button>

      <a
        href="#comments"
        className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm hover:border-navy"
      >
        <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
        {comments}
      </a>

      {shareOpen ? (
        <div className="absolute left-24 top-full z-10 mt-1 w-56 rounded-md border border-border bg-card p-2 shadow-card">
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
          <p className="px-2 pt-1 text-xs text-muted-foreground">Sharing is mocked in this build.</p>
        </div>
      ) : null}
    </div>
  );
}
