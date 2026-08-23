"use client";

import { useEffect, useRef, useState } from "react";

interface InlinePopoverProps {
  label: string;
  placeholder: string;
  submitLabel?: string;
  multiline?: boolean;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

/**
 * A minimal single-field popover: used wherever the editor needs a quick
 * text capture (link URL, video URL, embed code, a private note) without
 * reaching for a native `prompt()` or a full modal.
 */
export function InlinePopover({
  label,
  placeholder,
  submitLabel = "Add",
  multiline = false,
  onSubmit,
  onClose,
}: InlinePopoverProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return onClose();
    onSubmit(trimmed);
  };

  return (
    <div
      className="w-72 rounded-md border p-3 shadow-[var(--shadow-raised)]"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="kicker-muted mb-2">{label}</p>
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded border px-2 py-1.5 text-sm font-mono outline-none"
          style={{ borderColor: "var(--border)" }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded border px-2 py-1.5 text-sm outline-none"
          style={{ borderColor: "var(--border)", fontFamily: "var(--font-sans)" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onClose();
          }}
        />
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--navy)]">
          Cancel
        </button>
        <button type="button" onClick={submit} className="btn-accent px-3 py-1 text-xs">
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
