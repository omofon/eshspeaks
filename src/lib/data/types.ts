export type Tier = "logged-out" | "free" | "premium";

export interface Subsegment {
  slug: string;
  name: string;
}

export interface Section {
  slug: string;
  name: string;
  blurb: string;
  /** token name registered in styles.css, e.g. "politics" -> --color-tint-politics */
  tint: string;
  subsegments: Subsegment[];
}

export interface Comment {
  id: string;
  articleSlug: string;
  author: string;
  initials: string;
  time: string;
  body: string;
  replies?: Omit<Comment, "replies">[];
}

export interface ArticleImage {
  /** Path under /public, e.g. /images/news/politics/zoning-decision.jpg */
  src: string;
  /** Meaningful description of the scene. Required for accessibility. */
  alt: string;
  credit?: string;
}

interface LegacyComment {
  id: string;
  articleSlug: string;
  author: string;
  initials: string;
  time: string;
  body: string;
  replies?: unknown;
}
export type { LegacyComment };

export interface Article {
  slug: string;
  title: string;
  dek: string;
  section: string;
  subsegment: string;
  byline: string;
  location: string;
  date: string;
  readMinutes: number;
  premium: boolean;
  image: ArticleImage;
  curatedFrom?: string;
  curatedUrl?: string;
  likes: number;
  commentCount: number;
  body: string[];
  pullQuote: string;
}

export interface MarketTicker {
  label: string;
  value: number;
  unit?: string;
  prefix?: string;
  direction: "up" | "down";
  changePct: number;
}

export interface User {
  name: string;
  email: string;
  tier: Tier;
  state: string;
  joined: string;
}
