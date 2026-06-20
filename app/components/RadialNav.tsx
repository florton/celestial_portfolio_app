"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type RadialNavProps = {
  categories: Category[];
  rotation: MotionValue<number>;
  activeIndex: number;
  onActiveChange: (index: number) => void;
};

export default function RadialNav({
  categories,
  rotation,
  activeIndex,
  onActiveChange,
}: RadialNavProps) {
  const [geo, setGeo] = useState<Geo>(() => computeGeo(1280, 800));
  const [mounted, setMounted] = useState(false);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const draggingRef = useRef(false);
  const lastAngleRef = useRef(0);
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

  const snapToNearest = () => {
    const idx = Math.round(-rotation.get() / step);
    stopAnim();
    animRef.current = animate(rotation, -idx * step, {
      type: "spring",
      stiffness: 120,
      damping: 20,
      restDelta: 0.01,
    });
  };

  const step1 = (dir: 1 | -1) => snapTo(Math.round(-rotation.get() / step) + dir);

  const pointerAngle = (clientX: number, clientY: number) =>
    (Math.atan2(clientY - geo.cy, clientX - geo.cx) * 180) / Math.PI;

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    stopAnim();
    lastAngleRef.current = pointerAngle(e.clientX, e.clientY);
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
    snapToNearest();
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
