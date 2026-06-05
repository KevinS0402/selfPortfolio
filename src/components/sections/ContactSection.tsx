import { Button } from "@/components/ui/Button";
import { profile } from "@/data/profile";

export function ContactSection() {
  return (
    <section id="contact" className="bg-soft text-charcoal">
      <div className="mx-auto grid max-w-7xl gap-8 border-t border-line/80 px-5 py-16 md:grid-cols-[1fr_420px] md:px-8 lg:py-24">
        <div>
          <p className="text-sm font-semibold text-gold">Contact</p>
          <h2 className="mt-3 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] md:text-7xl">
            Let&apos;s build useful software with measurable impact.
          </h2>
        </div>
        <div className="rounded-[1.75rem] bg-paper p-6 shadow-glow ring-1 ring-line/70">
          <p className="text-xl font-medium leading-8 text-graphite">
            Open to software engineering, AI, and product opportunities across DC, NYC, Nashville,
            and remote teams.
          </p>
          <div className="mt-8 grid gap-3">
            <Button href={profile.links.email} variant="primary" target="_blank" rel="noreferrer">
              Email Kevin
            </Button>
            <Button href={profile.links.resume} variant="secondary" target="_blank" rel="noreferrer">
              Resume
            </Button>
            <Button href={profile.links.linkedin} variant="ghost" target="_blank" rel="noreferrer">
              LinkedIn
            </Button>
            <Button href={profile.links.github} variant="ghost" target="_blank" rel="noreferrer">
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
