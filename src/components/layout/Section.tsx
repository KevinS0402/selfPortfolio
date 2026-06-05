import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  label: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
};

export function Section({ id, label, title, children, dark = false }: SectionProps) {
  return (
    <section id={id} className={dark ? "bg-charcoal text-paper" : "bg-soft text-charcoal"}>
      <div className="mx-auto grid max-w-7xl gap-10 border-t border-line/80 px-5 py-16 md:grid-cols-[280px_1fr] md:px-8 lg:py-24">
        <div>
          <p className={`text-sm font-semibold ${dark ? "text-gold-soft" : "text-gold"}`}>
            {label}
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-5xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
