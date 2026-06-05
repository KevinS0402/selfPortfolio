import { Section } from "@/components/layout/Section";
import { projects } from "@/data/projects";

export function CaseStudyPreview() {
  const featured = projects.slice(0, 3);

  return (
    <Section id="case-studies" label="Case Studies" title="Technical depth has a reserved seat.">
      <div className="space-y-5">
        {featured.map((project) => (
          <article
            key={project.title}
            className="grid gap-6 rounded-[1.5rem] bg-paper p-6 shadow-glow ring-1 ring-line/70 md:grid-cols-[220px_1fr]"
          >
            <div>
              <p className="text-sm font-semibold text-gold">{project.domain}</p>
              <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.025em] text-charcoal">
                {project.title}
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-muted">Problem</p>
                <p className="mt-2 leading-7 text-graphite">{project.impact.problem}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">Approach</p>
                <p className="mt-2 leading-7 text-graphite">{project.technical.architecture}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">Tradeoffs</p>
                <p className="mt-2 leading-7 text-graphite">{project.technical.decisions}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
