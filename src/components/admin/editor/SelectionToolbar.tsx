"use client";

import { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  Pilcrow,
  Quote,
  Code2,
  MessageSquare,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { InlinePopover } from "./InlinePopover";

export interface SelectionToolbarProps {
  top: number;
  left: number;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onLink: (url: string) => void;
  onHeading: (level: "h1" | "h2" | "h3" | "h4") => void;
  onParagraph: () => void;
  onQuote: () => void;
  onCode: () => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  onAlign: (dir: "left" | "center" | "right" | "justify") => void;
  onNote: (note: string) => void;
}

const ICON_SIZE = 15;

export function SelectionToolbar({
  top,
  left,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onLink,
  onHeading,
  onParagraph,
  onQuote,
  onCode,
  onBulletList,
  onNumberedList,
  onAlign,
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
        <ToolbarButton label="Underline" onClick={onUnderline}>
          <Underline size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" onClick={onStrikethrough}>
          <Strikethrough size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={() => setOpenField("link")}>
          <Link2 size={ICON_SIZE} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Headline (H1)" onClick={() => onHeading("h1")}>
          <span className="font-serif text-[16px] font-semibold leading-none">H1</span>
        </ToolbarButton>
        <ToolbarButton label="Subheading (H2)" onClick={() => onHeading("h2")}>
          <span className="font-serif text-[14px] leading-none">H2</span>
        </ToolbarButton>
        <ToolbarButton label="Small heading (H3)" onClick={() => onHeading("h3")}>
          <span className="font-serif text-[12px] leading-none">H3</span>
        </ToolbarButton>
        <ToolbarButton label="Minor heading (H4)" onClick={() => onHeading("h4")}>
          <span className="font-serif text-[11px] leading-none">H4</span>
        </ToolbarButton>
        <ToolbarButton label="Paragraph (body text)" onClick={onParagraph}>
          <Pilcrow size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Pull quote" onClick={onQuote}>
          <Quote size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Inline code" onClick={onCode}>
          <Code2 size={ICON_SIZE} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Bulleted list" onClick={onBulletList}>
          <List size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={onNumberedList}>
          <ListOrdered size={ICON_SIZE} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Align left" onClick={() => onAlign("left")}>
          <AlignLeft size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Align centre" onClick={() => onAlign("center")}>
          <AlignCenter size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Align right" onClick={() => onAlign("right")}>
          <AlignRight size={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton label="Justify" onClick={() => onAlign("justify")}>
          <AlignJustify size={ICON_SIZE} />
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
