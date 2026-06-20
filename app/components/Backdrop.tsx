"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

type BackdropProps = {
  /** Shared wheel rotation in degrees. */
  rotation: MotionValue<number>;
  /** Active category accent (hex). */
  accent: string;
  reduced: boolean;
};

/**
 * A single GPU-composited background layer. We never swap images — one large
 * gradient disc parallax-rotates with the wheel, and the accent glow
 * cross-fades via CSS transition. Everything here animates `transform`,
 * `opacity`, and `filter` only, so the compositor does the work off the main
 * thread.
 */
export default function Backdrop({ rotation, accent, reduced }: BackdropProps) {
  // Parallax: the backdrop turns at a fraction of the wheel's angle.
  const discRotate = useTransform(rotation, (r) => r * 0.18);
  const discRotateStr = useTransform(discRotate, (d) => `${d}deg`);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06060a]"
    >
      {/* Accent wash — cross-fades color on category change. */}
      <div
        className="absolute inset-0 transition-[background] duration-700 ease-out"
        style={{
          background: `radial-gradient(120% 90% at 70% 30%, ${accent}33 0%, transparent 55%)`,
        }}
      />

      {/* The big parallax disc. Conic gradient gives the spinning-wheel read. */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] rounded-full opacity-[0.35] blur-2xl will-change-transform"
        style={{
          x: "-50%",
          y: "-50%",
          rotate: reduced ? 0 : discRotateStr,
          background: `conic-gradient(from 0deg, ${accent}00, ${accent}55, ${accent}00, ${accent}44, ${accent}00)`,
          transition: "background 700ms ease-out",
        }}
      />

      {/* Vignette + subtle grain for depth so the flat areas don't band. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_40%,#000_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
