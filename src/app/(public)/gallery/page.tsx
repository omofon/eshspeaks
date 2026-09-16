const EVENT_BLOCKS = [
  {
    title: "Lagos Social, September cohort",
    tiles: [
      { cap: "On stage", g1: "var(--orange)", g2: "#7A3B00" },
      { cap: "The room", g1: "var(--purple)", g2: "#2E1966" },
      { cap: "Meet & talk", g1: "var(--green)", g2: "#0F4A22" },
      { cap: "Take the Seat", g1: "var(--yellow)", g2: "#8A6300" },
      { cap: "Q&A", g1: "var(--red)", g2: "#7A1A0F" },
      { cap: "Networking", g1: "var(--purple)", g2: "#2A1F52" },
      { cap: "Host welcome", g1: "var(--orange)", g2: "#CE6A34" },
      { cap: "Closing notes", g1: "var(--green)", g2: "#7C9968" },
    ],
  },
  {
    title: "Abuja Roundtable, August cohort",
    tiles: [
      { cap: "Panel", g1: "var(--purple)", g2: "#2E1966" },
      { cap: "On stage", g1: "var(--orange)", g2: "#7A3B00" },
      { cap: "Front row", g1: "var(--yellow)", g2: "#8A6300" },
      { cap: "The room", g1: "var(--green)", g2: "#0F4A22" },
    ],
  },
  {
    title: "Port Harcourt Mixer, July cohort",
    tiles: [
      { cap: "Mixer", g1: "var(--red)", g2: "#7A1A0F" },
      { cap: "Meet & talk", g1: "var(--green)", g2: "#0F4A22" },
      { cap: "Closing", g1: "var(--purple)", g2: "#2A1F52" },
      { cap: "On stage", g1: "var(--orange)", g2: "#CE6A34" },
    ],
  },
];

export const metadata = {
  title: "Gallery",
  description: "Photos from past The Seat, Live gatherings.",
};

export default function GalleryPage() {
  return (
    <div className="bg-ink py-10 text-white sm:py-14">
      <div className="container-eshspeaks">
        <span className="chip border-white/20 bg-white/10 text-white">
          <span className="inline-block h-2 w-2 rounded-full bg-orange" />
          The Seat, Live
        </span>
        <h1 className="mb-8 mt-3.5 text-[32px] font-semibold text-white">Full Gallery</h1>

        {EVENT_BLOCKS.map((block) => (
          <div key={block.title} className="mb-12">
            <h3 className="mb-3.5 text-lg font-semibold text-white">{block.title}</h3>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {block.tiles.map((tile) => (
                <div
                  key={tile.cap}
                  className="relative aspect-square overflow-hidden rounded-2xl border-2 border-white/15"
                  style={{ background: `linear-gradient(150deg,${tile.g1},${tile.g2})` }}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 px-3 py-2.5 text-[11px] font-bold"
                    style={{ background: "linear-gradient(0deg, rgba(0,0,0,.75), transparent)" }}
                  >
                    {tile.cap}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
