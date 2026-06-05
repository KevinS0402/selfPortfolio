"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { creativeWorks } from "@/data/creativeWorks";
import { softSpring } from "@/lib/motion";

function CreativeCard({
  work,
  index,
  stretch = false,
}: {
  work: (typeof creativeWorks)[number];
  index: number;
  stretch?: boolean;
}) {
  return (
    <motion.article
      key={work.title}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ ...softSpring, delay: index * 0.04 }}
      className={`overflow-hidden rounded-[1.75rem] bg-paper p-6 shadow-glow ring-1 ring-line/70 transition-colors duration-300 hover:ring-gold/35 ${
        stretch ? "md:flex-1" : ""
      }`}
    >
      <div className="flex h-full flex-col">
        <div>
          <p className="text-sm font-semibold text-gold">{work.role}</p>
          <h3 className="mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.035em] text-charcoal md:text-4xl">
            {work.title}
          </h3>
          <p className="mt-5 max-w-2xl text-base leading-7 text-graphite md:text-lg">
            {work.summary}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {work.metrics.map((metric) => (
            <div
              key={`${work.title}-${metric.value}`}
              className="min-w-[7rem] flex-1 overflow-hidden rounded-2xl bg-soft px-3 py-4 ring-1 ring-line/70"
            >
              <p className="whitespace-nowrap text-xl font-semibold leading-none tracking-[-0.035em] text-charcoal sm:text-2xl">
                {metric.value}
              </p>
              <p className="mt-3 text-xs font-medium leading-5 text-muted sm:text-sm">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {work.details.map((detail) => (
            <p
              key={detail}
              className={
                work.compactDetails
                  ? "text-sm leading-6 text-muted"
                  : "border-t border-line/80 pt-3 text-sm leading-6 text-muted"
              }
            >
              {detail}
            </p>
          ))}
        </div>

        {work.tools ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-8">
            {work.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full bg-soft px-3 py-1.5 text-xs font-medium text-graphite ring-1 ring-line/70"
              >
                {tool}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

export function OtherWorksCreative() {
  const leftColumn = creativeWorks.slice(0, 2);
  const rightColumn = creativeWorks.slice(2);

  return (
    <Section id="creative" label="Other Works / Creative" title="Creative work with product instincts.">
      <div className="flex flex-col gap-5 md:flex-row md:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {leftColumn.map((work, index) => (
            <CreativeCard key={work.title} work={work} index={index} stretch />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {rightColumn.map((work, index) => (
            <CreativeCard key={work.title} work={work} index={index + leftColumn.length} stretch />
          ))}
        </div>
      </div>
    </Section>
  );
}
