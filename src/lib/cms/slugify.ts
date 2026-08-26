/**
 * The live `POST /api/v1/articles` schema requires a client-supplied
 * `slug` — there's no server-side slug generation. This derives one from
 * the title; the editor auto-runs it until the user edits the slug field
 * directly (see `DraftState.slugEdited`).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
