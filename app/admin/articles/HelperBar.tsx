"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const HINTS = [
  "Select text to change formatting, add headers, or create links.",
  "Add images and other media by starting a new line and clicking the plus sign.",
  "You can mention anyone in your story by typing @ and then their name.",
];

export function HelperBar() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 border-t"
      style={{ background: "var(--background-soft)", borderColor: "var(--rule)" }}
    >
      <div className="container-eshspeaks flex items-center justify-center gap-4 py-4">
        <button
          type="button"
          aria-label="Previous hint"
          onClick={() => setIndex((i) => (i - 1 + HINTS.length) % HINTS.length)}
          className="text-[var(--text-muted)] hover:text-[var(--navy)]"
        >
          <ChevronLeft size={18} />
        </button>

        <p className="max-w-md text-center text-sm text-[var(--text-secondary)]">{HINTS[index]}</p>

        <button
          type="button"
          aria-label="Next hint"
          onClick={() => setIndex((i) => (i + 1) % HINTS.length)}
          className="text-[var(--text-muted)] hover:text-[var(--navy)]"
        >
          <ChevronRight size={18} />
        </button>

        <button
          type="button"
          aria-label="Dismiss hints"
          onClick={() => setDismissed(true)}
          className="ml-2 text-[var(--text-muted)] hover:text-[var(--navy)]"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
