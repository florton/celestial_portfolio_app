"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { Category } from "@/app/data/portfolio";

const SIZE = 440; // logical wheel diameter in px (CSS-scaled for small screens)
const RADIUS = SIZE * 0.42; // orbit radius for node centers
const NODE = 96; // node box size

type RadialNavProps = {
  categories: Category[];
  rotation: MotionValue<number>;
  activeIndex: number;
  onActiveChange: (index: number) => void;
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export default function RadialNav({
  categories,
  rotation,
  activeIndex,
  onActiveChange,
}: RadialNavProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const draggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const scrollIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef(activeIndex);

  const count = categories.length;
  const step = 360 / count;

  // Keep the active category in sync with wherever the wheel currently sits.
  const syncActive = () => {
    const idx = mod(Math.round(-rotation.get() / step), count);
    if (idx !== lastActiveRef.current) {
      lastActiveRef.current = idx;
      onActiveChange(idx);
    }
  };

  // Fire active changes while spring/scroll animations are running too.
  useEffect(() => {
    const unsub = rotation.on("change", syncActive);
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation, step, count]);

  const stopAnim = () => {
    animRef.current?.stop();
    animRef.current = null;
  };

  const snapTo = (index: number) => {
    stopAnim();
    animRef.current = animate(rotation, -index * step, {
      type: "spring",
      stiffness: 120,
      damping: 18,
      restDelta: 0.01,
    });
  };

  /** Snap to whichever node is closest to the focal point right now. */
  const snapToNearest = () => {
    const idx = Math.round(-rotation.get() / step);
    stopAnim();
    animRef.current = animate(rotation, -idx * step, {
      type: "spring",
      stiffness: 130,
      damping: 18,
      restDelta: 0.01,
    });
  };

  /** Step relative to the node nearest the focal point (used by keys). */
  const step1 = (dir: 1 | -1) => {
    const current = Math.round(-rotation.get() / step);
    snapTo(current + dir);
  };

  const pointerAngle = (clientX: number, clientY: number) => {
    const rect = wheelRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

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
    rotation.set(rotation.get() + e.deltaY * 0.12);
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

  return (
    <div className="relative grid place-items-center scale-[0.66] sm:scale-90 lg:scale-100">
      <div
        ref={wheelRef}
        role="listbox"
        aria-label="Portfolio categories"
        aria-activedescendant={`wheel-node-${categories[activeIndex].id}`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheelScroll}
        onKeyDown={onKeyDown}
        style={{ width: SIZE, height: SIZE, touchAction: "none" }}
        className="relative cursor-grab touch-none rounded-full outline-none ring-offset-2 ring-offset-[#06060a] focus-visible:ring-2 focus-visible:ring-white/40 active:cursor-grabbing"
      >
        {/* Rotating rim — purely decorative mechanical feel. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full border border-white/10 will-change-transform"
          style={{ rotate: rotation }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15"
              style={{
                transform: `rotate(${i * step}deg) translateY(-${RADIUS}px)`,
              }}
            />
          ))}
        </motion.div>

        {/* Focal pointer at 12 o'clock. */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-white/70"
        />

        {/* Orbiting nodes — always upright, no counter-rotation. */}
        {categories.map((cat, i) => (
          <WheelNode
            key={cat.id}
            category={cat}
            index={i}
            count={count}
            rotation={rotation}
            isActive={i === activeIndex}
            onSelect={() => snapTo(i)}
          />
        ))}

        {/* Center hub. */}
        <Hub category={categories[activeIndex]} />
      </div>
    </div>
  );
}

function WheelNode({
  category,
  index,
  count,
  rotation,
  isActive,
  onSelect,
}: {
  category: Category;
  index: number;
  count: number;
  rotation: MotionValue<number>;
  isActive: boolean;
  onSelect: () => void;
}) {
  const step = 360 / count;
  const base = -90 + index * step; // focal point sits at top (-90°)

  const rad = useTransform(rotation, (r) => ((base + r) * Math.PI) / 180);
  const x = useTransform(rad, (a) => Math.cos(a) * RADIUS);
  const y = useTransform(rad, (a) => Math.sin(a) * RADIUS);
  // Depth cues from vertical position: top (focal) reads larger & brighter.
  const scale = useTransform(y, [-RADIUS, RADIUS], [1.12, 0.82]);
  const opacity = useTransform(y, [-RADIUS, 0, RADIUS], [1, 0.7, 0.4]);
  const zIndex = useTransform(y, (v) => Math.round(100 - v));

  return (
    <motion.button
      id={`wheel-node-${category.id}`}
      role="option"
      aria-selected={isActive}
      onClick={onSelect}
      className="absolute left-1/2 top-1/2 grid place-items-center rounded-2xl border text-center backdrop-blur-sm transition-colors will-change-transform"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex,
        width: NODE,
        height: NODE,
        marginLeft: -NODE / 2,
        marginTop: -NODE / 2,
        borderColor: isActive ? category.accent : "rgba(255,255,255,0.12)",
        background: isActive
          ? `${category.accent}22`
          : "rgba(255,255,255,0.04)",
        boxShadow: isActive ? `0 0 28px ${category.accent}66` : "none",
      }}
    >
      <span className="px-2 text-[13px] font-medium leading-tight text-white/90">
        {category.label}
      </span>
    </motion.button>
  );
}

function Hub({ category }: { category: Category }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/40 text-center backdrop-blur">
      <div
        className="absolute inset-0 rounded-full opacity-40 transition-[background] duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${category.accent}55, transparent 70%)`,
        }}
      />
      <div className="relative px-3">
        <div className="text-base font-semibold text-white">
          {category.label}
        </div>
        <div className="mt-1 text-[11px] leading-tight text-white/60">
          {category.tagline}
        </div>
      </div>
    </div>
  );
}
