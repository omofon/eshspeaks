// Rasterizes the EshSpeaks favicon mark into PNG + ICO.
// Pure rect/circle geometry, so we draw into an RGBA buffer directly
// (4x supersampled) instead of pulling in an image dependency.
const fs = require("fs");
const zlib = require("zlib");

const NAVY = [0x0d, 0x1b, 0x3d];
const CREAM = [0xf5, 0xf1, 0xe8];
const ORANGE = [0xc9, 0x54, 0x1f];
const GOLD = [0xd9, 0xa4, 0x41];

// Shapes in the SVG's 64x64 user space.
const RECTS = [
  { x: 12, y: 12, w: 40, h: 3, c: CREAM },
  { x: 12, y: 23, w: 30, h: 5, c: CREAM },
  { x: 12, y: 33, w: 22, h: 5, c: ORANGE },
  { x: 12, y: 43, w: 30, h: 5, c: CREAM },
  { x: 12, y: 23, w: 5, h: 25, c: CREAM },
];
const CIRCLE = { cx: 48, cy: 45, r: 4, c: GOLD };
const RADIUS = 6; // rounded square corner radius

function sampleAt(x, y) {
  // Outside the rounded-square plate -> transparent.
  const nx = Math.min(x, 64 - x);
  const ny = Math.min(y, 64 - y);
  if (nx < RADIUS && ny < RADIUS) {
    const dx = RADIUS - nx;
    const dy = RADIUS - ny;
    if (dx * dx + dy * dy > RADIUS * RADIUS) return null;
  }
  const dx = x - CIRCLE.cx;
  const dy = y - CIRCLE.cy;
  if (dx * dx + dy * dy <= CIRCLE.r * CIRCLE.r) return CIRCLE.c;
  for (let i = RECTS.length - 1; i >= 0; i--) {
    const r = RECTS[i];
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return r.c;
  }
  return NAVY;
}

const SS = 4; // supersample factor

function render(size) {
  const px = Buffer.alloc(size * size * 4);
  const scale = 64 / size;
  for (let py = 0; py < size; py++) {
    for (let pxi = 0; pxi < size; pxi++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const ux = (pxi + (sx + 0.5) / SS) * scale;
          const uy = (py + (sy + 0.5) / SS) * scale;
          const c = sampleAt(ux, uy);
          if (c) {
            r += c[0];
            g += c[1];
            b += c[2];
            a += 255;
          }
        }
      }
      const n = SS * SS;
      const o = (py * size + pxi) * 4;
      // Un-premultiply: color is the average over covered samples only.
      const cov = a / 255;
      px[o] = cov ? Math.round(r / cov) : 0;
      px[o + 1] = cov ? Math.round(g / cov) : 0;
      px[o + 2] = cov ? Math.round(b / cov) : 0;
      px[o + 3] = Math.round(a / n);
    }
  }
  return px;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function toPng(px, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  // Prefix each scanline with filter type 0.
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function toIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  const dirSize = 16 * entries.length;
  let offset = 6 + dirSize;
  const dirs = [];
  for (const e of entries) {
    const d = Buffer.alloc(16);
    d[0] = e.size >= 256 ? 0 : e.size;
    d[1] = e.size >= 256 ? 0 : e.size;
    d[2] = 0; // palette
    d[3] = 0;
    d.writeUInt16LE(1, 4); // color planes
    d.writeUInt16LE(32, 6); // bpp
    d.writeUInt32BE(0, 8);
    d.writeUInt32LE(e.png.length, 8);
    d.writeUInt32LE(offset, 12);
    dirs.push(d);
    offset += e.png.length;
  }
  return Buffer.concat([header, ...dirs, ...entries.map((e) => e.png)]);
}

const sizes = [16, 32, 48, 64, 180, 192, 512];
const pngs = {};
for (const s of sizes) pngs[s] = toPng(render(s), s);

fs.writeFileSync("public/favicon.ico", toIco([16, 32, 48].map((s) => ({ size: s, png: pngs[s] }))));
fs.writeFileSync("public/apple-touch-icon.png", pngs[180]);
fs.writeFileSync("public/icon-192.png", pngs[192]);
fs.writeFileSync("public/icon-512.png", pngs[512]);
console.log("wrote favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png");
