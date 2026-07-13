"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { categories } from "@/app/data/portfolio";
import Backdrop from "./Backdrop";
import RadialNav from "./RadialNav";
import CategoryCard from "./CategoryCard";

export default function PortfolioExperience() {
  const rotation = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useReducedMotion() ?? false;
  // const reduced = true
  const active = categories[activeIndex];

  return (
    <main className="relative flex min-h-screen flex-col">
      <Backdrop
        rotation={rotation}
        categories={categories}
        activeIndex={activeIndex}
        reduced={reduced}
      />

      <header className="pointer-events-none z-30 px-6 pt-8 text-center sm:pt-10">
        <p className="font-[var(--font-display)] text-xs uppercase tracking-[0.35em] text-[#fdf6e3]/70">
          Atlas Cœlestis
        </p>
        <h1 className="mt-2 font-[var(--font-display)] text-3xl uppercase tracking-[0.16em] text-[#fdf6e3] sm:text-5xl">
          Flanders Lorton
        </h1>
        <p className="mt-3 font-[var(--font-body)] text-base text-[#fdf6e3]/75 sm:text-lg">
          Senior Fullstack Developer · 8+ years shipping production web apps
          serving thousands of users.
        </p>
        <p className="mt-2 font-[var(--font-body)] text-xs uppercase tracking-[0.22em] text-[#fdf6e3]/50">
          React · TypeScript · Node · Go · GraphQL · AWS
        </p>
        <p className="mt-2 font-[var(--font-body)] text-sm italic text-[#fdf6e3]/40">
          {reduced
            ? "Choose a constellation"
            : "Drag the sky, scroll, or use the arrow keys"}
        </p>
      </header>

      {/* Sky stage: positioned parent for the wheel's drag surface + label. */}
      <section className="relative flex-1">
        {reduced ? (
          <div className="flex h-full items-center justify-center">
            <ReducedNav activeIndex={activeIndex} onSelect={setActiveIndex} />
          </div>
        ) : (
          <RadialNav
            categories={categories}
            rotation={rotation}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
          />
        )}

        {/* Fixed "current plate" label in the lower-left, over the hills and
            clear of both the bodies (upper-left) and the card (lower-right). */}
        <div className="pointer-events-none absolute bottom-[9vh] left-[5vw] z-30 max-w-[46vw]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="font-[var(--font-display)] text-2xl uppercase leading-tight tracking-[0.14em] sm:text-3xl"
                style={{ color: active.accent, textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}
              >
                {active.label}
              </div>
              <div className="mt-2 font-[var(--font-body)] text-lg italic text-[#fdf6e3]/80">
                {active.tagline}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Links card in the lower-right dead space. */}
        <CategoryCard category={active} reduced={reduced} />
      </section>
    </main>
  );
}

/** Reduced-motion / no-JS-friendly fallback. */
function ReducedNav({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <nav className="flex flex-wrap justify-center gap-2 px-6">
      {categories.map((cat, i) => (
        <button
          key={cat.id}
          onClick={() => onSelect(i)}
          aria-current={i === activeIndex}
          className="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors"
          style={{
            borderColor: i === activeIndex ? cat.accent : "rgba(253,246,227,0.25)",
            background: i === activeIndex ? `${cat.accent}22` : "rgba(253,246,227,0.04)",
            color: "#fdf6e3",
          }}
        >
          {cat.label}
        </button>
      ))}
    </nav>
  );
}
