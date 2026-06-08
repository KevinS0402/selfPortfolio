export type CreativeMetric = {
  value: string;
  label: string;
};

export type CreativeWork = {
  title: string;
  role: string;
  summary: string;
  details: string[];
  metrics: CreativeMetric[];
  tools?: string[];
  size?: "featured" | "wide" | "standard";
  compactDetails?: boolean;
};

export const creativeWorks: CreativeWork[] = [
  {
    title: "Metro Nashville Public Schools",
    role: "Strategy & Program Development Intern",
    summary:
      "Led an initiative to address tech gaps for music educators through a Vanderbilt Ingram Scholarship-funded project.",
    details: [
      "Developed an implementation toolkit to support district music program expansion and educator onboarding. This initiative was fully funded by the Vanderbilt Ingram Scholarship, a full-tuition merit award granted to less than 1% of students.",
    ],
    metrics: [
      { value: "10x", label: "program expansion rate increase" },
      { value: "80%", label: "teacher confidence improvement" },
      { value: "50%", label: "onboarding time reduction" },
    ],
    size: "featured",
    compactDetails: true,
  },
  {
    title: "DevelopIT Inc",
    role: "Co-Founder and CEO of 501(c)(3) Nonprofit",
    summary:
      "Built a national STEM education nonprofit providing pro-bono computer science lessons to underserved students.",
    details: [
      "Partnered with schools to teach Python, Java, web design, robotics, AI, machine learning, and cybersecurity.",
      "Devised a digital marketing strategy that generated 750+ daily views and expanded brand awareness across multiple school districts.",
    ],
    metrics: [
      { value: "25", label: "team members managed" },
      { value: "1500+", label: "students served" },
      { value: "200%+", label: "audience growth" },
    ],
    size: "wide",
  },
  {
    title: "KSONG",
    role: "International Recording Artist & Producer",
    summary:
      "Wrote, recorded, and produced original music that built a global audience with over 190K total streams.",
    details: [
      "Directed and edited music videos and promotional media across release campaigns.",
      "Blended creative direction, production, and audience-building across independent artist work.",
    ],
    metrics: [{ value: "190K+", label: "total streams" },
              { value: "66+", label: "total countries"}],
    size: "standard",
  },
  {
    title: "Vanderbilt Recording Studio",
    role: "President / Director",
    summary:
      "Oversaw studio operations and led a multidisciplinary team of over 20 members.",
    details: [
      "Hosted 10+ recording sessions and events per semester while doubling music output.",
      "Spearheaded a marketing presence that drove a 500% increase in views.",
    ],
    metrics: [
      { value: "20+", label: "members led" },
      { value: "150%", label: "participation increase" },
      { value: "500%", label: "views increase" },
    ],
    size: "standard",
  },
];
