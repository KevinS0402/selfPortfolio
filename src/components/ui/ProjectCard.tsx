"use client";

import { motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";
import { softSpring } from "@/lib/motion";

type ProjectCardProps = {
  project: Project;
  lens: "impact" | "technical";
  index: number;
  featured?: boolean;
};

export function ProjectCard({ project, lens, index, featured = false }: ProjectCardProps) {
  const content =
    lens === "impact"
      ? [
          ["Problem", project.impact.problem],
          ["Audience", project.impact.audience],
          ["Outcome", project.impact.outcome],
        ]
      : [
          ["Architecture", project.technical.architecture],
          ["Decision", project.technical.decisions],
          ["Depth", project.technical.depth],
        ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ ...softSpring, delay: index * 0.04 }}
      className={`group flex flex-col rounded-[1.5rem] bg-paper shadow-glow ring-1 ring-line/70 transition-colors duration-300 hover:ring-gold/35 ${
        featured ? "min-h-[420px] p-7 md:p-8" : "min-h-[460px] p-6"
      }`}
    >
      <div className={featured ? "grid gap-8 lg:grid-cols-[0.82fr_1.18fr]" : undefined}>
        <div>
          <div className="mb-8 flex items-start justify-between gap-4">
            <Badge label={project.domain} />
            <span className="text-lg font-semibold leading-none text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3
            className={`max-w-md font-semibold leading-[1.02] tracking-[-0.035em] text-charcoal ${
              featured ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"
            }`}
          >
            {project.title}
          </h3>
          <p className="mt-4 text-sm font-medium text-muted">{project.role}</p>
        </div>

        <div className={featured ? "space-y-5" : "mt-8 space-y-5"}>
          {content.map(([label, text]) => (
            <div key={label} className="border-t border-line pt-4">
              <p className="text-xs font-semibold text-gold">{label}</p>
              <p className="mt-2 text-base leading-7 text-graphite">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8">
        {project.links?.length || project.privateNote ? (
          <div className="mb-5 border-t border-line pt-4">
            {project.links?.length ? (
              <div className="flex flex-wrap gap-2">
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-paper ring-1 ring-charcoal/15 transition hover:bg-graphite focus-visible:shadow-[var(--focus-ring)]"
                  >
                    <span aria-hidden="true">{"\u{1F517} "}</span>
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
            {project.privateNote ? (
              <p className="text-sm leading-6 text-muted">
                <span aria-hidden="true">{"\u2605 "}</span>
                {project.privateNote}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <span
              key={item}
              className="rounded-full bg-soft px-3 py-1.5 text-xs font-medium text-muted ring-1 ring-line/70 transition group-hover:text-charcoal group-hover:ring-gold/30"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
