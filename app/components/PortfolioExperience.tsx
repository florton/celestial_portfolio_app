"use client";

import { useState } from "react";
import { useMotionValue, useReducedMotion } from "motion/react";
import { categories } from "@/app/data/portfolio";
import Backdrop from "./Backdrop";
import RadialNav from "./RadialNav";
import ProjectGrid from "./ProjectGrid";

export default function PortfolioExperience() {
  const rotation = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useReducedMotion() ?? false;
  const active = categories[activeIndex];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between gap-10 py-10">
      <Backdrop rotation={rotation} accent={active.accent} reduced={reduced} />

      <header className="px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Flanders Lorton
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Senior Fullstack Developer · React, performance, motion
        </p>
      </header>

      {reduced ? (
        <ReducedNav activeIndex={activeIndex} onSelect={setActiveIndex} />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <RadialNav
            categories={categories}
            rotation={rotation}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
          />
        </div>
      )}

      <div className="w-full">
        <p className="mb-5 text-center text-xs text-white/40">
          {reduced
            ? "Pick a category"
            : "Drag, scroll, or use arrow keys to spin the wheel"}
        </p>
        <ProjectGrid category={active} reduced={reduced} />
      </div>
    </main>
  );
}

/** Reduced-motion / no-JS-friendly fallback: a plain, fast category picker. */
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
          className="rounded-full border px-4 py-2 text-sm transition-colors"
          style={{
            borderColor:
              i === activeIndex ? cat.accent : "rgba(255,255,255,0.15)",
            background:
              i === activeIndex ? `${cat.accent}22` : "rgba(255,255,255,0.03)",
            color: "white",
          }}
        >
          {cat.label}
        </button>
      ))}
    </nav>
  );
}
