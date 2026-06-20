import { useId } from "react";
import type { CelestialKind } from "@/app/data/portfolio";

/** Mix a hex color toward white (f in 0..1). */
function lighten(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * f);
  const g = Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * f);
  const b = Math.round((n & 255) + (255 - (n & 255)) * f);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
/** Mix a hex color toward black (f in 0..1). */
function darken(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - f));
  const g = Math.round(((n >> 8) & 255) * (1 - f));
  const b = Math.round((n & 255) * (1 - f));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

type Props = {
  kind: CelestialKind;
  accent: string;
  size?: number;
  active?: boolean;
};

/**
 * Soft, Alto-style celestial body: layered radial-gradient bloom with no hard
 * outlines. Static SVG — never re-renders during wheel rotation. Bloom
 * strengthens when the body is the active (focused) one.
 */
export default function CelestialBody({
  kind,
  accent,
  size = 92,
  active = false,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const light = lighten(accent, 0.75);
  const core = lighten(accent, 0.5);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      style={{
        overflow: "visible",
        filter: `drop-shadow(0 0 ${active ? 16 : 8}px ${accent}${active ? "cc" : "77"})`,
      }}
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={light} stopOpacity="0.95" />
          <stop offset="38%" stopColor={accent} stopOpacity="0.5" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-orb`} cx="40%" cy="36%" r="70%">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={accent} />
          <stop offset="100%" stopColor={darken(accent, 0.35)} />
        </radialGradient>
      </defs>

      {/* Bloom halo, shared by all bodies. */}
      <circle cx="50" cy="50" r={kind === "comet" ? 30 : 46} fill={`url(#${uid}-glow)`} />

      {kind === "sun" && (
        <>
          <circle cx="50" cy="50" r="40" fill={`url(#${uid}-glow)`} opacity="0.7" />
          <circle cx="50" cy="50" r="24" fill={`url(#${uid}-orb)`} />
          <circle cx="50" cy="50" r="24" fill={light} opacity="0.22" />
        </>
      )}

      {kind === "moon" && (
        <>
          <circle cx="50" cy="50" r="26" fill={`url(#${uid}-orb)`} />
          <circle cx="60" cy="44" r="22" fill={light} opacity="0.18" />
        </>
      )}

      {kind === "planet" && (
        <>
          <ellipse
            cx="50"
            cy="54"
            rx="42"
            ry="12"
            fill="none"
            stroke={light}
            strokeWidth="3"
            opacity="0.45"
          />
          <circle cx="50" cy="49" r="22" fill={`url(#${uid}-orb)`} />
          <path
            d="M8 54 A42 12 0 0 0 92 54"
            fill="none"
            stroke={light}
            strokeWidth="2.4"
            opacity="0.6"
            strokeLinecap="round"
          />
        </>
      )}

      {kind === "star" && (
        <>
          <Sparkle uid={uid} color={light} accent={accent} />
          <circle cx="50" cy="50" r="6" fill={light} />
        </>
      )}

      {kind === "comet" && (
        <>
          <defs>
            <linearGradient id={`${uid}-tail`} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor={light} stopOpacity="0.85" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M45 40 L88 12 L55 60 Z"
            // d="M50 50 L88 12 Q93 20 84 28 L56 56 Z"
            fill={`url(#${uid}-tail)`}
            opacity="0.5"
          />
          <circle cx="50" cy="50" r="13" fill={`url(#${uid}-orb)`} />
          <circle cx="50" cy="50" r="13" fill={light} opacity="0.2" />
        </>
      )}

      {kind === "constellation" && (
        <Constellation uid={uid} accent={accent} light={light} />
      )}
    </svg>
  );
}

function Sparkle({
  uid,
  color,
  accent,
}: {
  uid: string;
  color: string;
  accent: string;
}) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-rayV`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-rayH`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M50 10 L57 50 L50 90 L43 50 Z" fill={`url(#${uid}-rayV)`} />
      <path d="M10 50 L50 43 L90 50 L50 57 Z" fill={`url(#${uid}-rayH)`} />
    </g>
  );
}

function Constellation({
  uid,
  accent,
  light,
}: {
  uid: string;
  accent: string;
  light: string;
}) {
  const dots: [number, number, number][] = [
    [16, 38, 3.4],
    [36, 62, 3],
    [52, 40, 5],
    [70, 64, 3],
    [86, 42, 3.4],
  ];
  return (
    <g>
      <polyline
        points={dots.map((d) => `${d[0]},${d[1]}`).join(" ")}
        fill="none"
        stroke={light}
        strokeWidth="1.2"
        opacity="0.4"
      />
      {dots.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r * 2.4} fill={accent} opacity="0.25" />
          <circle cx={x} cy={y} r={r} fill={light} />
        </g>
      ))}
    </g>
  );
}
