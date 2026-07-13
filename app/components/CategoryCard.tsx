"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Category } from "@/app/data/portfolio";

/**
 * A single card for the active category, parked in the lower-right dead space.
 * Lists the category's work as links and offers a CTA to a per-category page.
 */
export default function CategoryCard({
  category,
  reduced,
}: {
  category: Category;
  reduced: boolean;
}) {
  // Every project links out externally, so the "Explore" CTA points at the
  // category's primary (first) link rather than a non-existent /:id route.
  const primary = category.projects.find((p) => p.href)?.href;
  const primaryExternal =
    primary?.startsWith("http") || primary?.endsWith(".pdf");
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
              className="font-[var(--font-display)] text-sm uppercase tracking-[0.18em]"
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
                    className="group flex items-center justify-between gap-3 py-3 transition-colors hover:text-[#fdf6e3]"
                  >
                    <span className="text-[15px] text-[#fdf6e3]/80 group-hover:text-[#fdf6e3]">
                      {p.title}
                    </span>
                    <span
                      className="text-sm transition-transform group-hover:translate-x-0.5"
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

          {primary && (
            <a
              href={primary}
              target={primaryExternal ? "_blank" : undefined}
              rel={primaryExternal ? "noopener noreferrer" : undefined}
              className="mt-5 inline-flex items-center gap-1.5 font-[var(--font-display)] text-xs uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
              style={{ color: "#fdf6e3" }}
            >
              Explore {category.label}
              <span aria-hidden style={{ color: category.accent }}>
                {primaryExternal ? "↗" : "→"}
              </span>
            </a>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
