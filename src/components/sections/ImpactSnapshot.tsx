"use client";

import { motion } from "framer-motion";
import { achievements } from "@/data/profile";

export function ImpactSnapshot() {
  return (
    <section className="bg-soft pb-8 pt-0 text-charcoal md:pb-10" aria-labelledby="selected-achievements">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-4 flex flex-col gap-2 border-t border-line pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold">Signals of impact</p>
            <h2
              id="selected-achievements"
              className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em] text-charcoal md:text-3xl"
            >
              Recognition and proof that stands on its own.
            </h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.8, delay: index * 0.05 }}
              className="min-h-48 rounded-3xl bg-paper p-6 shadow-glow ring-1 ring-line/70"
            >
              <p className="text-[clamp(2.25rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.04em] text-charcoal">
                {achievement.value}
              </p>
              <h3 className="mt-6 text-lg font-semibold text-charcoal">{achievement.label}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{achievement.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
