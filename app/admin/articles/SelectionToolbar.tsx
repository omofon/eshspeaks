"use client";

import { useState } from "react";
import { Bold, Italic, Link2, Quote, Code2, MessageSquare } from "lucide-react";
import { InlinePopover } from "./InlinePopover";

export interface SelectionToolbarProps {
  top: number;
  left: number;
  onBold: () => void;
  onItalic: () => void;
  onLink: (url: string) => void;
  onHeading: (level: "h2" | "h3") => void;
  onQuote: () => void;
  onCode: () => void;
  onNote: (note: string) => void;
}

const ICON_SIZE = 15;

export function SelectionToolbar({
  top,
  left,
  onBold,
  onItalic,
  onLink,
  onHeading,
  onQuote,
  onCode,
  onNote,
}: SelectionToolbarProps) {
  const [openField, setOpenField] = useState<"link" | "note" | null>(null);

  return (
    <div
      className="fixed z-40 -translate-x-1/2 -translate-y-full"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {openField ? (
        <div className="mb-2">
          <InlinePopover
            label={openField === "link" ? "Add a link" : "Private note"}
            placeholder={openField === "link" ? "https://" : "Only editors will see this"}
            submitLabel={openField === "link" ? "Link" : "Add note"}
            onSubmit={(value) => {
              if (openField === "link") onLink(value);
              else onNote(value);
              setOpenField(null);
            }}
            onClose={() => setOpenField(null)}
          />
        </div>
      ) : null}

      <div
        className="flex items-center gap-0.5 rounded-md px-1 py-1 shadow-[var(--shadow-raised)]"
        style={{ background: "var(--navy-deep)" }}
      >
        <ToolbarButton label="Bold" onClick={onBold}>
          <Bold size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={onItalic}>
          <Italic size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={() => setOpenField("link")}>
          <Link2 size={ICON_SIZE} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Large title" onClick={() => onHeading("h2")}>
          <span className="font-serif text-[15px] leading-none">T</span>
        </ToolbarButton>
        <ToolbarButton label="Subtitle" onClick={() => onHeading("h3")}>
          <span className="font-serif text-[12px] leading-none">T</span>
        </ToolbarButton>
        <ToolbarButton label="Pull quote" onClick={onQuote}>
          <Quote size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Code" onClick={onCode}>
          <Code2 size={ICON_SIZE} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Private note" onClick={() => setOpenField("note")}>
          <MessageSquare size={ICON_SIZE} />
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-white/85 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-4 w-px" style={{ background: "rgba(255,255,255,0.16)" }} />;
}
