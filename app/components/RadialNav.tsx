"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  animate,
  motion,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { Category } from "@/app/data/portfolio";
import CelestialBody from "./CelestialBody";

const NODE = 230; // base node box size in px (scaled by viewport)

type Geo = {
  cx: number;
  cy: number;
  radius: number;
  focalDeg: number;
  vw: number;
  vh: number;
  /** Viewport scale so the wheel shrinks on small windows. */
  vs: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Wheel center off-canvas bottom-right; focal body lands in the upper-left. */
function computeGeo(vw: number, vh: number): Geo {
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
 * A full ring of stars around the wheel center, dense enough that the on-screen
 * portion always looks full. Rotates with the wheel; whether they're *visible*
 * is handled by a day/night opacity so they only show on the night side.
 */
/** Deterministic hash-noise in [0,1) for natural (non-gridded) scatter. */
function rand(n: number) {
  const x = Math.sin(n * 127.1 + 0.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A uniform-density disc of stars around the wheel center. A disc is
 * rotation-invariant, so spinning it never opens gaps at any angle — and with
 * overflow visible the off-canvas portion still paints. Random radius/angle
 * give a natural, clump-free night sky.
 */
function makeStars(geo: Geo) {
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

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

/**
 * Engraved compass rose behind the wheel's celestial center (bottom-right).
 * Purely decorative: turns 1:1 with the sky, and stays faded so the category
 * card floating above it remains readable.
 */
function CompassRose({
  geo,
  rotation,
}: {
  geo: Geo;
  rotation: MotionValue<number>;
}) {
  const R = Math.min(geo.vw, geo.vh) * 0.75;
  // Polar helper in compass convention: 0° = north (up), clockwise.
  const pt = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [Math.cos(a) * r, Math.sin(a) * r] as const;
  };
  // Degree ring: a tick every 5°, heavier every 15°, heaviest at cardinals.
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const deg = i * 5;
    const len = i % 18 === 0 ? 12 : i % 3 === 0 ? 8 : 4.5;
    const [x1, y1] = pt(deg, 97);
    const [x2, y2] = pt(deg, 97 - len);
    return { x1, y1, x2, y2, major: i % 18 === 0 };
  });
  // Each point of the rose is a two-tone kite: one half filled, one hollow.
  const rosePoint = (deg: number, len: number, hw: number) => {
    const [tx, ty] = pt(deg, len);
    const [lx, ly] = pt(deg - 90, hw);
    const [rx, ry] = pt(deg + 90, hw);
    return {
      filled: `${tx},${ty} ${rx},${ry} 0,0`,
      hollow: `${tx},${ty} ${lx},${ly} 0,0`,
    };
  };
  const points = [
    ...[45, 135, 225, 315].map((d) => rosePoint(d, 52, 6.5)),
    ...[0, 90, 180, 270].map((d) => rosePoint(d, 82, 9)),
  ];
  const letters = [
    ["N", 0],
    ["E", 90],
    ["S", 180],
    ["W", 270],
  ] as const;

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{
        left: geo.cx - R,
        top: geo.cy - R,
        width: R * 2,
        height: R * 2,
        rotate: rotation,
        opacity: 0.2,
      }}
    >
      <svg viewBox="-115 -115 230 230" className="h-full w-full" fill="none">
        <g stroke="#fdf6e3">
          <circle r="112" strokeOpacity="0.35" strokeWidth="0.5" />
          <circle r="97" strokeOpacity="0.8" strokeWidth="1" />
          <circle r="85" strokeOpacity="0.5" strokeWidth="0.6" />
          <circle r="58" strokeOpacity="0.3" strokeWidth="0.5" />
          <circle r="3" strokeOpacity="0.8" strokeWidth="1" />
          <line x1="-97" x2="97" strokeOpacity="0.15" strokeWidth="0.5" />
          <line y1="-97" y2="97" strokeOpacity="0.15" strokeWidth="0.5" />
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              strokeOpacity={t.major ? 0.9 : 0.45}
              strokeWidth={t.major ? 1 : 0.5}
            />
          ))}
        </g>
        {points.map((p, i) => (
          <g key={i}>
            <polygon points={p.filled} fill="#fdf6e3" fillOpacity="0.8" />
            <polygon
              points={p.hollow}
              fill="#fdf6e3"
              fillOpacity="0.18"
              stroke="#fdf6e3"
              strokeOpacity="0.6"
              strokeWidth="0.5"
            />
          </g>
        ))}
        {letters.map(([ch, d]) => {
          const [x, y] = pt(d, 106);
          return (
            <text
              key={ch}
              x={x}
              y={y}
              fill="#fdf6e3"
              fillOpacity="0.9"
              fontSize="11"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {ch}
            </text>
          );
        })}
      </svg>
    </motion.div>
  );
}

type RadialNavProps = {
  categories: Category[];
  rotation: MotionValue<number>;
  activeIndex: number;
  onActiveChange: (index: number) => void;
  /** Populated with a step handler so external controls (e.g. header arrows)
   *  can advance the wheel by one category. */
  controlsRef?: MutableRefObject<((dir: 1 | -1) => void) | null>;
};

export default function RadialNav({
  categories,
  rotation,
  activeIndex,
  onActiveChange,
  controlsRef,
}: RadialNavProps) {
  const [geo, setGeo] = useState<Geo>(() => computeGeo(1280, 800));
  const [mounted, setMounted] = useState(false);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const draggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const dragStartRotationRef = useRef(0);
  const scrollIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef(activeIndex);

  const count = categories.length;
  const step = 360 / count;

  useEffect(() => {
    setMounted(true);
    const update = () => setGeo(computeGeo(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const syncActive = () => {
    const idx = mod(Math.round(-rotation.get() / step), count);
    if (idx !== lastActiveRef.current) {
      lastActiveRef.current = idx;
      onActiveChange(idx);
    }
  };

  useEffect(() => {
    const unsub = rotation.on("change", syncActive);
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation, step, count]);

  const stars = useMemo(() => makeStars(geo), [geo]);

  // Day/night: stars fade to nothing at the sun (day) and up at the moon
  // (night, half a turn away), smoothly through every category between.
  const starOpacity = useTransform(rotation, (r) => {
    const p = mod(-r / step, count);
    const nightness = (1 - Math.cos((p / count) * 2 * Math.PI)) / 2;
    return 0.03 + 0.62 * nightness;
  });

  const stopAnim = () => {
    animRef.current?.stop();
    animRef.current = null;
  };

  const snapTo = (index: number) => {
    stopAnim();
    // Target the rotationally-equivalent angle nearest the current rotation, so
    // clicking a body never unwinds the full turns scrolling has accumulated.
    const base = -index * step;
    const current = rotation.get();
    const target = base + 360 * Math.round((current - base) / 360);
    animRef.current = animate(rotation, target, {
      type: "spring",
      stiffness: 110,
      damping: 20,
      restDelta: 0.01,
    });
  };

  const snapToIndex = (idx: number) => {
    stopAnim();
    animRef.current = animate(rotation, -idx * step, {
      type: "spring",
      stiffness: 120,
      damping: 20,
      restDelta: 0.01,
    });
  };

  const snapToNearest = () => snapToIndex(Math.round(-rotation.get() / step));

  const step1 = (dir: 1 | -1) => snapTo(Math.round(-rotation.get() / step) + dir);

  // Expose the step handler so header arrows can drive the wheel.
  if (controlsRef) controlsRef.current = step1;

  const pointerAngle = (clientX: number, clientY: number) =>
    (Math.atan2(clientY - geo.cy, clientX - geo.cx) * 180) / Math.PI;

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    stopAnim();
    lastAngleRef.current = pointerAngle(e.clientX, e.clientY);
    dragStartRotationRef.current = rotation.get();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const a = pointerAngle(e.clientX, e.clientY);
    let delta = a - lastAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngleRef.current = a;
    rotation.set(rotation.get() + delta);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    // Light commit: a drag past ~1/5 of a step advances to the next category
    // in the drag direction, rather than bouncing back until the halfway mark.
    const moved = rotation.get() - dragStartRotationRef.current;
    const startIdx = Math.round(-dragStartRotationRef.current / step);
    let idx = Math.round(-rotation.get() / step);
    if (idx === startIdx && Math.abs(moved) > step * 0.2) {
      idx = startIdx - Math.sign(moved);
    }
    snapToIndex(idx);
  };

  const onWheelScroll = (e: React.WheelEvent) => {
    stopAnim();
    rotation.set(rotation.get() + e.deltaY * 0.1);
    if (scrollIdleRef.current) clearTimeout(scrollIdleRef.current);
    scrollIdleRef.current = setTimeout(snapToNearest, 130);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      step1(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      step1(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      snapTo(0);
    }
  };

  // Client-only: motion serializes numeric transforms differently than SSR,
  // so rendering the wheel on the server causes a hydration mismatch. It's
  // purely interactive, so we render it after mount.
  if (!mounted) return null;

  return (
    <>
      {/* Node + orbit layer: covers the viewport, transparent to pointer events
          except the bodies themselves. */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        role="listbox"
        aria-label="Portfolio categories"
        aria-activedescendant={`wheel-node-${categories[activeIndex].id}`}
      >
        {/* Compass rose at the celestial center — painted first so the stars,
            orbit ring, and bodies all layer above it. */}
        <CompassRose geo={geo} rotation={rotation} />

        {/* Star field — rotates 1:1 with the wheel around the same center, so
            the sky turns together with the bodies. */}
        <motion.svg
          className="absolute inset-0 h-full w-full will-change-transform"
          style={{
            rotate: rotation,
            opacity: starOpacity,
            overflow: "visible",
            transformOrigin: `${geo.cx}px ${geo.cy}px`,
          }}
        >
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.rad} fill="#fdf6e3" opacity={s.o} />
          ))}
        </motion.svg>

        <svg className="absolute inset-0 h-full w-full">
          <circle
            cx={geo.cx}
            cy={geo.cy}
            r={geo.radius}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.07"
          />
        </svg>
        {categories.map((cat, i) => (
          <WheelNode
            key={cat.id}
            category={cat}
            index={i}
            step={step}
            geo={geo}
            rotation={rotation}
            isActive={i === activeIndex}
            onSelect={() => snapTo(i)}
          />
        ))}
      </div>

      {/* Sky drag surface: full viewport, below the bodies (z-10) and content
          (z-20) so you can spin from anywhere empty, while clicks on bodies and
          project cards still land. */}
      <div
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheelScroll}
        onKeyDown={onKeyDown}
        style={{ touchAction: "none" }}
        className="fixed inset-0 z-10 cursor-grab outline-none focus-visible:ring-1 focus-visible:ring-white/30 active:cursor-grabbing"
        aria-hidden
      />
    </>
  );
}

export function ArrowButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#fdf6e3]/25 bg-[#fdf6e3]/[0.06] text-[#fdf6e3]/80 backdrop-blur-sm transition-colors hover:border-[#fdf6e3]/60 hover:bg-[#fdf6e3]/15 hover:text-[#fdf6e3] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? (
          <polyline points="15 5 8 12 15 19" />
        ) : (
          <polyline points="9 5 16 12 9 19" />
        )}
      </svg>
    </button>
  );
}

function WheelNode({
  category,
  index,
  step,
  geo,
  rotation,
  isActive,
  onSelect,
}: {
  category: Category;
  index: number;
  step: number;
  geo: Geo;
  rotation: MotionValue<number>;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { cx, cy, radius, focalDeg, vs } = geo;
  const focalRad = (focalDeg * Math.PI) / 180;
  const base = focalDeg + index * step;
  const nodeBox = NODE * vs;

  const angle = useTransform(rotation, (r) => ((base + r) * Math.PI) / 180);
  const x = useTransform(angle, (a) => cx + Math.cos(a) * radius);
  const y = useTransform(angle, (a) => cy + Math.sin(a) * radius);
  // Prominence from angular proximity to the focal direction.
  const prox = useTransform(angle, (a) => Math.cos(a - focalRad));
  const scale = useTransform(prox, [-1, 0.3, 1], [0.5, 0.82, 1.2]);
  const opacity = useTransform(prox, [-0.1, 0.45, 1], [0, 0.65, 1]);
  const zIndex = useTransform(prox, (p) => Math.round(p * 100) + 200);

  return (
    <motion.button
      id={`wheel-node-${category.id}`}
      role="option"
      aria-selected={isActive}
      aria-label={category.label}
      onClick={onSelect}
      className="pointer-events-auto absolute left-0 top-0 flex flex-col items-center justify-center gap-2"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex,
        width: nodeBox,
        height: nodeBox,
        marginLeft: -nodeBox / 2,
        marginTop: -nodeBox / 2,
        pointerEvents: "none",
        cursor: "inherit"
      }}
    >
      <CelestialBody
        kind={category.body}
        accent={category.accent}
        size={(isActive ? 178 : 146) * category.scale * vs}
        active={isActive}
      />
      <span
        className="px-1 text-center uppercase tracking-[0.16em] text-[#fdf6e3]"
        style={{
          fontSize: 13 * vs,
          textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          opacity: isActive ? 1 : 0.7,
        }}
      >
        {category.label}
      </span>
    </motion.button>
  );
}
