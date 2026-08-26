"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

/**
 * `body` stays `string` on the wire and in the CMS draft — no block/JSON content schema was
 * introduced. It just holds two different kinds of string depending on how the story was
 * written:
 *
 *  - Legacy / plain text: paragraphs separated by a blank line (`\n\n`). Existing articles
 *    written before the rich editor look like this, and it's still what a caller passing plain
 *    text (no markup) produces.
 *  - Rich HTML: what `ArticleEditor`'s contentEditable body actually saves — `<p>`, `<h2>`,
 *    `<ul><li>`, `<figure><img/><figcaption/></figure>`, `<iframe>` embeds, `<hr/>`, etc.
 *
 * This component tells the two apart (a string with no HTML tags at all is treated as legacy
 * plain text) and renders each correctly, so the public page never shows raw `<p>` tags as
 * visible text for a story authored in the rich editor, and never breaks an old plain-text
 * article that has no markup to sanitize in the first place.
 */

const ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "code",
  "pre",
  "mark",
  "figure",
  "figcaption",
  "img",
  "div",
  "iframe",
  "hr",
  "span",
  "ul",
  "ol",
  "li",
];

const ALLOWED_ATTR = [
  "class",
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "style",
  "loading",
  "allow",
  "allowfullscreen",
  "frameborder",
  "title",
];

/**
 * Providers the editor's InsertMenu actually generates iframes/embeds for (see
 * `lib/api/oembed.ts`). Anything else gets its `<iframe>` dropped rather than rendered — the
 * "Embed raw HTML" editor action doesn't insert live markup today (it stores the pasted text as
 * an escaped, inert code sample), but a future change to that feature — or a compromised
 * editorial account — is exactly the case a hardcoded allowlist protects against, per the
 * "whitelist supported providers" requirement.
 */
const TRUSTED_IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
];

function isTrustedIframeSrc(src: string | null): boolean {
  if (!src) return false;
  try {
    const url = new URL(src, "https://placeholder.invalid");
    return url.protocol === "https:" && TRUSTED_IFRAME_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

let hooksInstalled = false;
function installSanitizerHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe" && node instanceof Element) {
      if (!isTrustedIframeSrc(node.getAttribute("src"))) {
        node.remove();
      }
    }
  });
}

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

function sanitize(html: string): string {
  installSanitizerHooks();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export function ArticleBody({ body, className = "" }: { body: string; className?: string }) {
  const isHtml = useMemo(() => looksLikeHtml(body), [body]);

  const clean = useMemo(() => {
    if (!isHtml || typeof window === "undefined") return null;
    return sanitize(body);
  }, [body, isHtml]);

  if (!isHtml) {
    const paragraphs = body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    return (
      <div className={`space-y-6 ${className}`}>
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>
    );
  }

  // SSR/no-window fallback: this never actually ships real content server-side today (ArticleView
  // fetches client-side, so the real body only ever renders in the browser — see useArticle), but
  // guard it anyway rather than call a browser-only sanitizer without a DOM.
  if (clean === null) return null;

  // Sanitized above via DOMPurify — see sanitize().
  return (
    <div className={`article-body ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
