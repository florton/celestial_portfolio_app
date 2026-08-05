/**
 * Pure geometry and math behind the radial wheel, kept free of React and of
 * `motion` so it can be reasoned about (and tested) on its own. RadialNav is
 * then just the part that binds these to motion values and DOM events.
 */

export type Geo = {
  cx: number;
  cy: number;
  radius: number;
  focalDeg: number;
  vw: number;
  vh: number;
  /** Viewport scale so the wheel shrinks on small windows. */
  vs: number;
};

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Positive modulo: `mod(-1, 7) === 6`, unlike JS `%`. */
export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

/** Wheel center off-canvas bottom-right; focal body lands in the upper-left. */
export function computeGeo(vw: number, vh: number): Geo {
  const cx = vw * 0.92;
  const cy = vh * 1.02;
  const tx = vw * 0.27;
  const ty = vh * 0.44;
  const dx = tx - cx;
  const dy = ty - cy;
  return {
    cx,
    cy,
    radius: Math.hypot(dx, dy),
    focalDeg: (Math.atan2(dy, dx) * 180) / Math.PI,
    vw,
    vh,
    vs: clamp(Math.min(vw, vh) / 860, 0.5, 1.1),
  };
}

/**
 * The angle equivalent to `base` (mod 360) that sits nearest `current`, so
 * snapping to a category never unwinds the full turns scrolling has piled up.
 */
export function nearestEquivalentAngle(current: number, base: number) {
  return base + 360 * Math.round((current - base) / 360);
}

/**
 * Where a rotation lands on the day → night cycle: 0 at the sun (index 0),
 * 1 half a turn away, smooth everywhere between. Drives star opacity.
 */
export function nightness(rotation: number, step: number, count: number) {
  const p = mod(-rotation / step, count);
  return (1 - Math.cos((p / count) * 2 * Math.PI)) / 2;
}

/** Deterministic hash-noise in [0,1) for natural (non-gridded) scatter. */
export function rand(n: number) {
  const x = Math.sin(n * 127.1 + 0.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A uniform-density disc of stars around the wheel center. A disc is
 * rotation-invariant, so spinning it never opens gaps at any angle, and with
 * overflow visible the off-canvas portion still paints. Random radius/angle
 * give a natural, clump-free night sky.
 */
export function makeStars(geo: Geo) {
  const R2 = Math.hypot(geo.cx, geo.cy) * 1.02; // reaches the far corner
  return Array.from({ length: 600 }, (_, i) => {
    const ang = rand(i + 1) * Math.PI * 2;
    const r = Math.sqrt(rand(i + 137)) * R2;
    const s = rand(i + 251);
    return {
      x: geo.cx + Math.cos(ang) * r,
      y: geo.cy + Math.sin(ang) * r,
      rad: s > 0.92 ? 2.6 : s > 0.7 ? 1.8 : 1.2,
      o: 0.32 + rand(i + 379) * 0.42,
    };
  });
}
