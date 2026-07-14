"use client";

import {
  motion,
  useMotionTemplate,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { Category } from "@/app/data/portfolio";

type BackdropProps = {
  rotation: MotionValue<number>;
  categories: Category[];
  activeIndex: number;
  reduced: boolean;
};

/**
 * The sky. A single full-screen gradient whose three stops interpolate
 * continuously between each category's (now near-black) time-of-day palette as
 * the wheel turns. A rotating star field turns gently with the wheel, fixed
 * stars sit behind it for parallax, and rolling hills ground the base. All
 * colour/transform work runs on motion values, off the React render path.
 */
export default function Backdrop({
  rotation,
  categories,
  activeIndex,
  reduced,
}: BackdropProps) {
  const n = categories.length;
  const step = 360 / n;

  const phase = useTransform(rotation, (r) => {
    const p = (-r / step) % n;
    return p < 0 ? p + n : p;
  });

  const range = Array.from({ length: n + 1 }, (_, i) => i);
  const tops = [...categories.map((c) => c.sky[0]), categories[0].sky[0]];
  const mids = [...categories.map((c) => c.sky[1]), categories[0].sky[1]];
  const hors = [...categories.map((c) => c.sky[2]), categories[0].sky[2]];

  const top = useTransform(phase, range, tops);
  const mid = useTransform(phase, range, mids);
  const hor = useTransform(phase, range, hors);
  const gradient = useMotionTemplate`linear-gradient(180deg, ${top} 0%, ${mid} 46%, ${hor} 100%)`;

  const active = categories[activeIndex];
  const staticGradient = `linear-gradient(180deg, ${active.sky[0]} 0%, ${active.sky[1]} 46%, ${active.sky[2]} 100%)`;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05060c]">
      {reduced ? (
        <div
          className="absolute inset-0 transition-[background] duration-700 ease-out"
          style={{ background: staticGradient }}
        />
      ) : (
        <motion.div className="absolute inset-0" style={{ background: gradient }} />
      )}

      {/* Rolling hills. Tinted silhouettes, layered for depth. */}
      <svg
        className="absolute bottom-0 left-0 h-[40dvh] w-full"
        viewBox="0 0 100 46"
        preserveAspectRatio="none"
      >
        <path
          d="M0 20 Q12 11 25 17 Q38 23 50 16 Q62 9 75 17 Q88 24 100 15 L100 46 L0 46 Z"
          fill="rgba(46,34,78,0.55)"
        />
        <path
          d="M0 28 Q15 20 30 26 Q45 32 60 25 Q75 18 88 26 Q95 30 100 26 L100 46 L0 46 Z"
          fill="rgba(20,16,40,0.78)"
        />
        <path
          d="M0 36 Q20 29 40 35 Q60 41 80 34 Q92 30 100 35 L100 46 L0 46 Z"
          fill="rgba(6,5,14,0.96)"
        />
      </svg>
    </div>
  );
}

