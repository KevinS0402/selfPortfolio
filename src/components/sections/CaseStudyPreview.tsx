import { projects } from "@/data/projects";

const caseStudyCopy = {
  SongSearch: {
    principle: "Low-friction product flow",
    decision:
      "Made upload the only required action, then translated complex audio and lyric signals into fast originality and quality feedback.",
    impact:
      "The workflow fit how artists actually make release decisions: quick enough to use in the moment, but technical enough to reveal meaningful music patterns.",
  },
  SignLect: {
    principle: "Constraints before polish",
    decision:
      "Designed around Raspberry Pi deployment, prioritizing real-time detection speed and classroom affordability over heavier infrastructure.",
    impact:
      "That kept the accessibility tool closer to the served community: portable, lower-cost, and usable in the settings where support is needed.",
  },
  AIHealth: {
    principle: "Time-boxed prioritization",
    decision:
      "Led the team toward a simple conversational flow that turned health inputs into practical AI-generated fitness and meal plans.",
    impact:
      "The focused, user-centered direction helped the project win the VandyHacks X L3 Harris Award among 50+ teams.",
  },
} as const;

export function CaseStudyPreview() {
  const featured = projects
    .filter((project) => project.title in caseStudyCopy)
    .sort(
      (a, b) =>
        Object.keys(caseStudyCopy).indexOf(a.title) - Object.keys(caseStudyCopy).indexOf(b.title),
    );

  return (
    <section id="case-studies" className="bg-charcoal text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 border-t border-line/80 px-5 py-16 md:grid-cols-[280px_1fr] md:px-8 lg:py-24">
        <div>
          <p className="text-sm font-semibold text-gold-soft">Case Studies</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-5xl">
            Product decisions shaped by real users.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((project, index) => {
            const copy = caseStudyCopy[project.title as keyof typeof caseStudyCopy];

            return (
              <article
                key={project.title}
                className="rounded-[1.5rem] bg-paper/6 p-6 ring-1 ring-paper/12 transition duration-300 hover:bg-paper/10 hover:ring-gold/40"
              >
                <p className="text-4xl font-semibold leading-none tracking-[-0.04em] text-gold-soft">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-8 text-sm font-semibold text-gold-soft">{project.domain}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-paper">
                  {project.title}
                </h3>
                <p className="mt-2 text-base font-semibold text-paper/80">{copy.principle}</p>
                <div className="mt-6 space-y-4">
                  <p className="text-lg leading-7 text-paper/72">{copy.decision}</p>
                  <p className="border-t border-paper/12 pt-4 text-base leading-7 text-paper/62">
                    {copy.impact}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
