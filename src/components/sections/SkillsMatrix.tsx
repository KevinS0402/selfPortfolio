import { Section } from "@/components/layout/Section";
import { skills } from "@/data/skills";

export function SkillsMatrix() {
  return (
    <Section id="skills" label="Skills" title="A matrix for building and deciding.">
      <div className="grid gap-4 md:grid-cols-2">
        {skills.map((skill) => (
          <article key={skill.group} className="rounded-[1.5rem] bg-paper p-6 shadow-glow ring-1 ring-line/70">
            <h3 className="text-3xl font-semibold tracking-[-0.03em] text-charcoal">{skill.group}</h3>
            <div className="mt-6 flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <span key={item} className="rounded-full bg-soft px-3 py-2 text-sm font-medium text-graphite ring-1 ring-line/70">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
