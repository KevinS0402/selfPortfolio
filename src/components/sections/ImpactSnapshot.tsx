"use client";

import { motion } from "framer-motion";
import { impactStats } from "@/data/profile";

export function ImpactSnapshot() {
  return (
    <section className="bg-soft text-charcoal">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 md:grid-cols-4 md:px-8">
        {impactStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.8, delay: index * 0.05 }}
            className="min-h-48 rounded-3xl bg-paper p-6 shadow-glow ring-1 ring-line/70"
          >
            <p className="text-5xl font-semibold leading-none tracking-[-0.04em] text-charcoal md:text-6xl">
              {stat.value}
            </p>
            <h2 className="mt-6 text-lg font-semibold text-charcoal">{stat.label}</h2>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{stat.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
