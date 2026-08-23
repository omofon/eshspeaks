"use client";

/**
 * TODO(backend): there's no user-search endpoint yet, so this list is a
 * static stand-in (the same byline pool used in lib/data/articles.ts's
 * mock data) rather than a real newsroom directory. See
 * CMS-BACKEND-REQUESTS.md. Swap MOCK_PEOPLE for a debounced API call once
 * one exists — the component's props already take a filtered list, so
 * only the caller (ArticleEditor) needs to change.
 */
export const MOCK_PEOPLE = [
  "Adaeze Okonkwo",
  "Ibrahim Sule",
  "Folake Adeyemi",
  "Emeka Nwachukwu",
  "Hauwa Bala",
  "Tunde Bakare-Ojo",
  "Ngozi Eze",
  "Samuel Dogo",
];

export interface MentionMenuProps {
  top: number;
  left: number;
  query: string;
  onPick: (name: string) => void;
}

export function MentionMenu({ top, left, query, onPick }: MentionMenuProps) {
  const matches = MOCK_PEOPLE.filter((name) => name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

  if (matches.length === 0) return null;

  return (
    <div
      className="fixed z-40 w-56 overflow-hidden rounded-md border py-1 shadow-[var(--shadow-raised)]"
      style={{ top, left, background: "var(--card)", borderColor: "var(--border)" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {matches.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onPick(name)}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[var(--muted)]"
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
            style={{ background: "var(--navy)", color: "var(--text-inverse)" }}
          >
            {name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </span>
          {name}
        </button>
      ))}
    </div>
  );
}
