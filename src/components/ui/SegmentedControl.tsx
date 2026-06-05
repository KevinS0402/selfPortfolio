"use client";

import { motion } from "framer-motion";
import { softSpring } from "@/lib/motion";

type Lens = "impact" | "technical";

type SegmentedControlProps = {
  value: Lens;
  onChange: (value: Lens) => void;
};

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  return (
    <div
      className="inline-grid grid-cols-2 rounded-full bg-mist p-1 ring-1 ring-line/80"
      role="tablist"
      aria-label="Recruiter lens"
    >
      {(["impact", "technical"] as Lens[]).map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={`relative min-h-11 rounded-full px-4 text-sm font-semibold transition ${
              active ? "text-charcoal" : "text-muted hover:text-charcoal"
            }`}
          >
            {active && (
              <motion.span
                layoutId="recruiter-lens-active"
                transition={softSpring}
                className="absolute inset-0 rounded-full bg-paper shadow-sm ring-1 ring-gold/30"
              />
            )}
            <span className="relative z-10">{option === "impact" ? "Impact View" : "Technical View"}</span>
          </button>
        );
      })}
    </div>
  );
}
