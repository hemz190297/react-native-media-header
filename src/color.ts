/** Small colour helpers: parse CSS-ish strings, HSV maths, the "readable background" transform. */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** Parses `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb(...)`, `rgba(...)`. Returns `null` for anything else. */
export function parseColor(input: string): RGB | null {
  const s = input.trim();
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0]! + hex[0]!, 16);
      const g = parseInt(hex[1]! + hex[1]!, 16);
      const b = parseInt(hex[2]! + hex[2]!, 16);
      return Number.isNaN(r + g + b) ? null : { r, g, b };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return Number.isNaN(r + g + b) ? null : { r, g, b };
    }
    return null;
  }
  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(s);
  if (m) {
    return { r: clamp255(Number(m[1])), g: clamp255(Number(m[2])), b: clamp255(Number(m[3])) };
  }
  return null;
}

export function toHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((v) => clamp255(v).toString(16).padStart(2, '0')).join('');
}

export function rgbToHsv({ r, g, b }: RGB): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
    if (h < 0) h += 1;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToRgb(h: number, s: number, v: number): RGB {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0;
  let g = 0;
  let b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    default: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * A darker, slightly desaturated version of the colour that reads well as a full-screen
 * background behind light text. Default `background.transform`. Unparseable input is returned as-is.
 */
export function readableBackground(color: string): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  const { h, s, v } = rgbToHsv(rgb);
  return toHex(hsvToRgb(h, Math.min(s * 0.9, 0.55), Math.min(v * 0.35, 0.18)));
}

/** A vivid random colour (random hue, s 0.7, v 0.9) as hex. */
export function randomVividColor(): string {
  return toHex(hsvToRgb(Math.random(), 0.7, 0.9));
}

/** `color` with the given alpha, as `rgba(...)`. Unparseable input is returned as-is. */
export function withAlpha(color: string, alpha: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}
