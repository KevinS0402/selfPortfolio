import { Section } from "@/components/layout/Section";

const productFrames = [
  ["User problem", "Define who is blocked, what friction exists, and why solving it now matters."],
  ["Constraints", "Name technical, time, data, team, and adoption limits before choosing the build path."],
  ["Prioritization", "Separate must-ship behavior from polish, then stage learning loops around risk."],
  ["Impact", "Tie prototypes and systems back to measurable outcomes, user feedback, and next decisions."],
];

export function ProductThinking() {
  return (
    <Section id="product" label="Product Thinking" title="CS rigor with business judgment." dark>
      <div className="grid gap-4 md:grid-cols-2">
        {productFrames.map(([title, copy], index) => (
          <article
            key={title}
            className="rounded-[1.5rem] bg-paper/6 p-6 ring-1 ring-paper/12 transition duration-300 hover:bg-paper/10 hover:ring-gold/40"
          >
            <p className="text-4xl font-semibold leading-none tracking-[-0.04em] text-gold-soft">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-8 text-2xl font-semibold tracking-[-0.02em] text-paper">{title}</h3>
            <p className="mt-3 text-lg leading-7 text-paper/72">{copy}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
