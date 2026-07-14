"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Category } from "@/app/data/portfolio";

/**
 * A single card for the active category, parked in the lower-right dead space.
 * Lists the category's work as links.
 */
export default function CategoryCard({
  category,
  reduced,
}: {
  category: Category;
  reduced: boolean;
}) {
  // Fallback href for projects without their own link.
  const primary = category.projects.find((p) => p.href)?.href;
  return (
    <div className="pointer-events-auto absolute bottom-6 right-6 z-30 w-[min(94vw,440px)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={category.id}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border p-7 backdrop-blur-md"
          style={{
            borderColor: "rgba(253,246,227,0.14)",
            background: "rgba(8,10,22,0.55)",
            boxShadow: `0 14px 48px rgba(0,0,0,0.45), inset 0 0 32px ${category.accent}1a`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: category.accent, boxShadow: `0 0 10px ${category.accent}` }}
            />
            <span
              className="font-[var(--font-display)] text-base font-bold uppercase tracking-[0.18em]"
              style={{ color: category.accent }}
            >
              {category.label}
            </span>
          </div>

          <ul className="mt-4 flex flex-col divide-y divide-[#fdf6e3]/10 border-y border-[#fdf6e3]/10">
            {category.projects.map((p) => {
              // Open external URLs and PDF downloads in a new tab.
              const external =
                p.href?.startsWith("http") || p.href?.endsWith(".pdf");
              return (
                <li key={p.title}>
                  <a
                    href={p.href ?? primary ?? "#"}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="group flex items-start justify-between gap-3 py-3 transition-colors hover:text-[#fdf6e3]"
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[17px] font-semibold text-[#fdf6e3]/90 group-hover:text-[#fdf6e3]">
                        {p.title}
                      </span>
                      {/* Collapsed by default; expands on hover/focus. Touch
                          devices have no hover, so keep it always visible there. */}
                      <span className="grid [grid-template-rows:0fr] transition-[grid-template-rows] duration-300 motion-reduce:transition-none group-hover:[grid-template-rows:1fr] group-focus-visible:[grid-template-rows:1fr] pointer-coarse:[grid-template-rows:1fr]">
                        <span className="overflow-hidden text-[13px] leading-snug text-[#fdf6e3]/60">
                          {p.blurb}
                        </span>
                      </span>
                      <span
                        className="text-[11px] uppercase tracking-[0.14em]"
                        style={{ color: `${category.accent}cc` }}
                      >
                        {p.stack.join(" · ")}
                      </span>
                    </span>
                    <span
                      className="mt-0.5 text-base transition-transform group-hover:translate-x-0.5"
                      style={{ color: category.accent }}
                      aria-hidden
                    >
                      {external ? "↗" : "→"}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
