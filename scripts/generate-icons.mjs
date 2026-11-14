// Generates every app icon from one SVG design (`npm run icons`).
//
// The motif is the dumbbell from the "Übungen" tab icon, drawn on the default
// Emerald accent with the app's light tokens. Two variants:
//   • small — bolder strokes, bigger glyph: stays legible in a 16 px browser tab
//   • large — more breathing room: iOS/Android home screens
// Rasterised with Playwright's Chromium so 16 px edges stay crisp.
//
// Outputs:
//   app/icon.svg                    browser tab (Next file convention)
//   app/favicon.ico                 16/32/48 fallback (PNG-in-ICO)
//   app/apple-icon.png              180, full-bleed — iOS rounds the corners itself
//   public/icons/icon-{192,512}.png rounded, transparent corners (manifest "any")
//   public/icons/icon-maskable-512.png full-bleed, glyph inside the 80 % safe zone

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const VARIANTS = {
  small: { scale: 17.5, plate: 3.6, bar: 3.0, outer: 3.0 },
  large: { scale: 15, plate: 3.2, bar: 2.6, outer: 2.6 },
};

/** The design, on a 512 canvas. Glyph = the tab icon's 24-unit dumbbell path. */
export function iconSvg({ variant = "large", fullBleed = false } = {}) {
  const v = VARIANTS[variant];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#169468"/>
      <stop offset="1" stop-color="#0d6649"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512"${fullBleed ? "" : ' rx="112"'} fill="url(#bg)"/>
  <g transform="translate(256 256) scale(${v.scale}) translate(-12 -12)" fill="none" stroke-linecap="round">
    <path d="M3 9v6M21 9v6" stroke="#bfe0d0" stroke-width="${v.outer}"/>
    <path d="M6 12h12" stroke="#fdfcf9" stroke-width="${v.bar}"/>
    <path d="M6 7v10M18 7v10" stroke="#fdfcf9" stroke-width="${v.plate}"/>
  </g>
</svg>
`;
}

async function renderPng(page, svg, size) {
  await page.setViewportSize({ width: size, height: size });
  const sized = svg.replace("<svg ", `<svg width="${size}" height="${size}" `);
  await page.setContent(`<html><body style="margin:0;background:transparent">${sized}</body></html>`);
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}

/** ICO container holding PNG images (supported by all current browsers). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = header.length + dir.length;
  images.forEach(({ size, png }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o); // width
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1); // height
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.png)]);
}

function write(rel, data) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
  console.log("wrote", rel, `(${data.length} bytes)`);
}

const browser = await chromium.launch();
try {
  const page = await (await browser.newContext({ deviceScaleFactor: 1 })).newPage();
  const small = iconSvg({ variant: "small" });
  const large = iconSvg({ variant: "large" });
  const largeBleed = iconSvg({ variant: "large", fullBleed: true });

  write("app/icon.svg", small);
  const ico = [];
  for (const size of [16, 32, 48]) ico.push({ size, png: await renderPng(page, small, size) });
  write("app/favicon.ico", buildIco(ico));
  write("app/apple-icon.png", await renderPng(page, largeBleed, 180));
  write("public/icons/icon-192.png", await renderPng(page, large, 192));
  write("public/icons/icon-512.png", await renderPng(page, large, 512));
  write("public/icons/icon-maskable-512.png", await renderPng(page, largeBleed, 512));
} finally {
  await browser.close();
}
