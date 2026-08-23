export type EmbedKind = "youtube" | "vimeo" | "twitter" | "facebook" | "generic";

export function detectEmbedKind(url: string): EmbedKind {
  if (/youtu\.be\/|youtube\.com\/watch\?v=/.test(url)) return "youtube";
  if (/vimeo\.com\/\d+/.test(url)) return "vimeo";
  if (/(twitter\.com|x\.com)\/\w+\/status\/\d+/.test(url)) return "twitter";
  if (/facebook\.com\//.test(url)) return "facebook";
  return "generic";
}

export function toVideoEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

/**
 * Twitter/X's oEmbed endpoint is public and CORS-enabled — no backend
 * proxy needed, works from the browser as-is.
 */
export async function fetchTwitterEmbedHtml(url: string): Promise<string> {
  const res = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`);
  if (!res.ok) throw new Error(`Twitter oEmbed failed (${res.status})`);
  const body = await res.json();
  return body.html as string;
}

/**
 * Facebook's embed requires the Facebook JS SDK to be loaded on the page
 * to render `<div class="fb-post">` markup — that script isn't part of
 * this delivery (it'd need to go in the app's root layout, e.g.
 * `<script async src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0">`).
 * Until that's added, this markup will sit inert. Facebook's oEmbed API
 * additionally requires a Graph API app token for server-side calls,
 * which only a backend can hold safely — see CMS-BACKEND-REQUESTS.md.
 */
export function facebookEmbedMarkup(url: string): string {
  return `<div class="fb-post" data-href="${url.replace(/"/g, "&quot;")}" data-width="552"></div>`;
}
