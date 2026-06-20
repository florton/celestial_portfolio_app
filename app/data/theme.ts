/**
 * Celestial-atlas palette — hand-tinted engraving on a deep night sky.
 * These are a physical-color scene, so they stay fixed in light/dark mode.
 */
export const sky = {
  deep: "#0b1730", // outer night
  mid: "#15294e", // mid sky
  hi: "#22407a", // lit center
  panel: "#16294e", // inner disc fill
  gold: "#d8b75e", // gilded rim
  goldLine: "#e8d39a", // fine engraving lines
  cream: "#f3ead0", // highlights / outlines on dark
  ink: "#0c1830", // darkest
  earth: "#1d3361", // foreground band
} as const;
