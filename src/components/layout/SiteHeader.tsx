"use client";

import { motion } from "framer-motion";
import { navItems } from "@/lib/constants";
import { AnimatedUnderline } from "@/components/ui/AnimatedUnderline";

export function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.8 }}
      className="sticky top-0 z-50 border-b border-line/80 bg-soft/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 md:px-8">
        <a href="#top" className="text-base font-semibold leading-none tracking-[-0.01em] text-charcoal">
          Kevin Song
        </a>
        <nav className="hidden items-center gap-3 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <AnimatedUnderline key={item.href} href={item.href}>
              {item.label}
            </AnimatedUnderline>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-paper transition hover:bg-graphite focus-visible:shadow-[var(--focus-ring)]"
        >
          Contact
        </a>
      </div>
    </motion.header>
  );
}
