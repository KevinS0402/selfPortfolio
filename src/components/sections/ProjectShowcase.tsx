"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { projects } from "@/data/projects";

export function ProjectShowcase() {
  const [lens, setLens] = useState<"impact" | "technical">("impact");

  return (
    <section id="projects" className="bg-soft text-charcoal">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold text-gold">Projects</p>
            <h2 className="mt-3 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] md:text-7xl">
              One portfolio, two recruiter lenses.
            </h2>
          </div>
          <SegmentedControl value={lens} onChange={setLens} />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} lens={lens} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
