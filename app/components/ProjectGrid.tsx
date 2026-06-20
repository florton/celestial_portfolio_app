"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import type { Category } from "@/app/data/portfolio";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 260,
      damping: 24,
    },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
};

export default function ProjectGrid({
  category,
  reduced,
}: {
  category: Category;
  reduced: boolean;
}) {
  return (
    <section
      aria-label={`${category.label} projects`}
      className="mx-auto w-full max-w-3xl px-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={category.id}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {category.projects.map((p, i) => {
            const Tag = p.href ? motion.a : motion.div;
            return (
              <Tag
                key={p.title}
                {...(p.href
                  ? {
                      href: p.href,
                      target: p.href.startsWith("http") ? "_blank" : undefined,
                      rel: p.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined,
                    }
                  : {})}
                custom={i}
                variants={reduced ? undefined : cardVariants}
                initial={reduced ? false : "hidden"}
                animate={reduced ? undefined : "show"}
                exit={reduced ? undefined : "exit"}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: category.accent }}
                  />
                  <h3 className="font-semibold text-white">{p.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {p.blurb}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/55"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </Tag>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
