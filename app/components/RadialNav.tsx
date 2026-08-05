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
import {
  computeGeo,
  makeStars,
  mod,
  nearestEquivalentAngle,
  nightness,
  type Geo,
} from "@/app/lib/wheel";
import CelestialBody from "./CelestialBody";

const NODE = 230; // base node box size in px (scaled by viewport)

/** Pointer travel (px) below which a press on a body counts as a click, not a drag. */
const CLICK_SLOP = 6;

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
  const pressPointRef = useRef({ x: 0, y: 0 });

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
  const starOpacity = useTransform(
    rotation,
    (r) => 0.03 + 0.62 * nightness(r, step, count),
  );

  const stopAnim = () => {
    animRef.current?.stop();
    animRef.current = null;
  };

  const snapTo = (index: number) => {
    stopAnim();
    // Target the rotationally-equivalent angle nearest the current rotation, so
    // clicking a body never unwinds the full turns scrolling has accumulated.
    const target = nearestEquivalentAngle(rotation.get(), -index * step);
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

  // Expose the step handler so header arrows can drive the wheel. Assigned in
  // an effect rather than during render, which React treats as a side effect.
  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = step1;
    return () => {
      controlsRef.current = null;
    };
  });

  const pointerAngle = (clientX: number, clientY: number) =>
    (Math.atan2(clientY - geo.cy, clientX - geo.cx) * 180) / Math.PI;

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    stopAnim();
    lastAngleRef.current = pointerAngle(e.clientX, e.clientY);
    dragStartRotationRef.current = rotation.get();
    pressPointRef.current = { x: e.clientX, y: e.clientY };
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

  /**
   * Bodies are draggable *and* clickable: a press on one starts the same sky
   * drag, and only releases that barely moved count as a click. Without this,
   * making the bodies clickable would swallow every drag that happened to
   * start on top of one.
   *
   * The wheel handler is repeated here for the same reason. The sky surface is
   * a *sibling* of the bodies, not an ancestor, so a scroll over a body never
   * bubbles to it — without this, scroll-to-rotate would die wherever a body
   * sits under the cursor.
   */
  const nodePointerHandlers = (onSelect: () => void) => ({
    onPointerDown,
    onPointerMove,
    onWheel: onWheelScroll,
    onPointerUp: (e: React.PointerEvent) => {
      const { x, y } = pressPointRef.current;
      if (
        draggingRef.current &&
        Math.hypot(e.clientX - x, e.clientY - y) <= CLICK_SLOP
      ) {
        draggingRef.current = false;
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        onSelect();
        return;
      }
      endDrag(e);
    },
    onPointerCancel: endDrag,
  });

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
          except the bodies themselves. This is also the listbox: per the
          activedescendant pattern the container takes focus and the arrow keys,
          and the individual options stay out of the tab order. */}
      <div
        className="pointer-events-none fixed inset-0 z-20 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/40"
        role="listbox"
        tabIndex={0}
        aria-label="Portfolio categories"
        aria-activedescendant={`wheel-node-${categories[activeIndex].id}`}
        onKeyDown={onKeyDown}
      >
        {/* Compass rose at the celestial center, painted first so the stars,
            orbit ring, and bodies all layer above it. */}
        <CompassRose geo={geo} rotation={rotation} />

        {/* Star field, rotates 1:1 with the wheel around the same center, so
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
            pointerHandlers={nodePointerHandlers(() => snapTo(i))}
          />
        ))}
      </div>

      {/* Sky drag surface: full viewport, below the bodies (z-10) and content
          (z-20) so you can spin from anywhere empty, while clicks on bodies and
          project cards still land. */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheelScroll}
        style={{ touchAction: "none" }}
        className="fixed inset-0 z-10 cursor-grab active:cursor-grabbing"
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
  pointerHandlers,
}: {
  category: Category;
  index: number;
  step: number;
  geo: Geo;
  rotation: MotionValue<number>;
  isActive: boolean;
  pointerHandlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onWheel: (e: React.WheelEvent) => void;
  };
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
  // Bodies on the far side of the wheel are faded out; keep them from
  // intercepting presses meant for the sky behind them.
  const pointerEvents = useTransform(prox, (p) => (p > 0.1 ? "auto" : "none"));

  return (
    <motion.button
      id={`wheel-node-${category.id}`}
      type="button"
      role="option"
      aria-selected={isActive}
      aria-label={category.label}
      // Options are driven by the listbox's aria-activedescendant, so they stay
      // out of the tab order; the container owns focus and the arrow keys.
      tabIndex={-1}
      {...pointerHandlers}
      className="absolute left-0 top-0 flex cursor-pointer flex-col items-center justify-center gap-2 active:cursor-grabbing"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex,
        pointerEvents,
        width: nodeBox,
        height: nodeBox,
        marginLeft: -nodeBox / 2,
        marginTop: -nodeBox / 2,
        touchAction: "none",
      }}
    >
      <CelestialBody
        kind={category.body}
        accent={category.accent}
        hues={category.hues}
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
