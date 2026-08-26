"use client";

import { useRef, useState } from "react";
import { Plus, ImagePlus, Search, Link2, Code2, Terminal, Minus } from "lucide-react";
import { InlinePopover } from "./InlinePopover";

export interface InsertMenuProps {
  top: number;
  left: number;
  onInsertImageFile: (file: File) => void;
  onInsertImageFromLibrary: (query: string) => void;
  onInsertEmbedLink: (url: string) => void;
  onInsertCodeBlock: () => void;
  onInsertEmbed: (code: string) => void;
  onInsertDivider: () => void;
}

type Panel = "library" | "embedLink" | "embedCode" | null;

const ICON_SIZE = 16;

export function InsertMenu({
  top,
  left,
  onInsertImageFile,
  onInsertImageFromLibrary,
  onInsertEmbedLink,
  onInsertCodeBlock,
  onInsertEmbed,
  onInsertDivider,
}: InsertMenuProps) {
  const [expanded, setExpanded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const closeAll = () => {
    setExpanded(false);
    setPanel(null);
  };

  return (
    <div
      className="fixed z-30 flex items-start"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        aria-label={expanded ? "Close insert menu" : "Insert media"}
        onClick={() => setExpanded((v) => !v)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform"
        style={{
          borderColor: "var(--rule)",
          color: "var(--navy)",
          background: "var(--card)",
          transform: expanded ? "rotate(45deg)" : "none",
        }}
      >
        <Plus size={18} />
      </button>

      {expanded ? (
        <div className="ml-2">
          <div
            className="animate-rise flex items-center gap-1 rounded-full border px-1.5 py-1"
            style={{
              borderColor: "var(--rule)",
              background: "var(--card)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <StripButton label="Upload image" onClick={() => fileInput.current?.click()}>
              <ImagePlus size={ICON_SIZE} />
            </StripButton>
            <StripButton label="Search media library" onClick={() => setPanel("library")}>
              <Search size={ICON_SIZE} />
            </StripButton>
            <StripButton
              label="Embed a link (YouTube, X, Facebook, or any URL)"
              onClick={() => setPanel("embedLink")}
            >
              <Link2 size={ICON_SIZE} />
            </StripButton>
            <StripButton
              label="Code block"
              onClick={() => {
                onInsertCodeBlock();
                closeAll();
              }}
            >
              <Terminal size={ICON_SIZE} />
            </StripButton>
            <StripButton label="Embed raw HTML" onClick={() => setPanel("embedCode")}>
              <Code2 size={ICON_SIZE} />
            </StripButton>
            <StripButton
              label="Divider"
              onClick={() => {
                onInsertDivider();
                closeAll();
              }}
            >
              <Minus size={ICON_SIZE} />
            </StripButton>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onInsertImageFile(file);
              e.target.value = "";
              closeAll();
            }}
          />

          {panel ? (
            <div className="mt-2">
              {panel === "library" && (
                <InlinePopover
                  label="Search the media library"
                  placeholder="e.g. National Assembly chamber"
                  submitLabel="Insert"
                  onSubmit={(q) => {
                    onInsertImageFromLibrary(q);
                    closeAll();
                  }}
                  onClose={closeAll}
                />
              )}
              {panel === "embedLink" && (
                <InlinePopover
                  label="Paste a link"
                  placeholder="YouTube, X/Twitter, Facebook, or any URL"
                  submitLabel="Embed"
                  onSubmit={(url) => {
                    onInsertEmbedLink(url);
                    closeAll();
                  }}
                  onClose={closeAll}
                />
              )}
              {panel === "embedCode" && (
                <InlinePopover
                  label="Embed raw HTML"
                  placeholder="<iframe ...> or a component key"
                  submitLabel="Embed"
                  multiline
                  onSubmit={(code) => {
                    onInsertEmbed(code);
                    closeAll();
                  }}
                  onClose={closeAll}
                />
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StripButton({
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
      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--navy)] transition-colors hover:bg-[var(--navy-tint)]"
    >
      {children}
    </button>
  );
}
