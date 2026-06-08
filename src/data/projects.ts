export type Project = {
  title: string;
  domain: string;
  role: string;
  stack: string[];
  links?: {
    label: string;
    href: string;
  }[];
  privateNote?: string;
  impact: {
    problem: string;
    audience: string;
    outcome: string;
  };
  technical: {
    architecture: string;
    decisions: string;
    depth: string;
  };
};

export const projects: Project[] = [
  {
    title: "SongSearch",
    domain: "AI / Music Technology",
    role: "Independent project",
    stack: ["React", "TypeScript", "Firebase", "Google Cloud Run", "Bun"],
    links: [
      {
        label: "Case study",
        href: "https://github.com/KevinS0402/SongSearchCaseStudy",
      },
    ],
    impact: {
      problem: "Help artists and teams verify song originality before release using automated music analysis.",
      audience: "Musicians, producers, and music teams evaluating originality, quality, and marketability.",
      outcome: "Built an upload-only workflow that returns ML-driven originality and quality signals in under 30 seconds.",
    },
    technical: {
      architecture: "React frontend connects to Firebase storage/database and Cloud Run inference services for audio extraction and analysis.",
      decisions: "Combined information-theoretic metrics with lyrical identification, motif repetition, rhythmic predictability, and harmonic tension.",
      depth: "Designed secure end-to-end audio extraction and inference pipelines requiring no user input beyond file upload.",
    },
  },
  {
    title: "SignLect",
    domain: "Accessibility Tech",
    role: "Independent project",
    stack: ["Python", "PyTorch", "YOLO", "Ultralytics", "Raspberry Pi"],
    privateNote:
      "Private repo; model walkthrough and selected source excerpts available upon request.",
    impact: {
      problem: "Make American Sign Language detection and translation more accessible in educational settings.",
      audience: "Students with hearing impairments and educators using affordable classroom hardware.",
      outcome: "Optimized deployment on Raspberry Pi 5 and improved inference speed by 100%.",
    },
    technical: {
      architecture: "Camera input runs through a custom YOLO model on Raspberry Pi 5 for real-time sign detection.",
      decisions: "Trained with PyTorch on Google Colab GPUs using open-source ASL datasets, then optimized for edge constraints.",
      depth: "Focused on model compression, hardware-aware deployment, and instant translation behavior for accessibility use cases.",
    },
  },
  {
    title: "NIST SimPROCESD Tooling",
    domain: "Software Engineering",
    role: "Software engineering intern",
    stack: ["Python", "NumPy", "PySide6", "Matplotlib", "Git"],
    links: [
      {
        label: "SURF presentation",
        href: "https://drive.google.com/file/d/1dKzmMHg8W1KJuIwIzQ0t8eQo-AhPnSbn/view?usp=sharing",
      },
    ],
    impact: {
      problem: "Improve how researchers visualize and analyze data for Industrial AI simulation environments.",
      audience: "NIST researchers and open-source users working with SimPROCESD.",
      outcome: "Feature was adopted into SimPROCESD and produced a tenfold improvement in data processing and calculation efficiency.",
    },
    technical: {
      architecture: "Built an interactive PySide6 interface with NumPy-backed calculations and Matplotlib visualization dashboards.",
      decisions: "Prioritized intuitive graphing, reproducible simulations, and maintainable open-source repository structure.",
      depth: "Maintained Git workflows and improved repository organization while shipping production-facing analysis tools.",
    },
  },
  {
    title: "Handshake MOVE",
    domain: "AI Evaluation",
    role: "AI model validation fellow",
    stack: ["Dataset Curation", "Model Evaluation", "QA", "Human Feedback"],
    impact: {
      problem: "Strengthen AI model behavior through high-quality data annotation and human-aligned validation.",
      audience: "Teams improving model quality, reliability, and real-world usability.",
      outcome: "Annotated 20+ datasets, evaluated model outputs, and assessed 50+ websites for product quality signals.",
    },
    technical: {
      architecture: "Validation workflow combines dataset curation, output review, iterative testing, and website feature assessment.",
      decisions: "Focused on aligning outputs with human intent, usability, and domain-specific quality criteria.",
      depth: "Built judgment around supervised-learning data quality, evaluation rubrics, and model behavior review.",
    },
  },
  {
    title: "AIHealth",
    domain: "AI Product",
    role: "Team lead, VandyHacks X",
    stack: ["React", "JavaScript", "HTML", "CSS", "OpenAI API"],
    links: [
      {
        label: "Devpost",
        href: "https://devpost.com/software/happy-health-irg7fd",
      },
    ],
    impact: {
      problem: "Give users a more personal way to generate fitness plans and nutritious meal ideas from health metrics.",
      audience: "Hackathon users looking for practical, personalized health guidance.",
      outcome: "Led a 4-person team and won the L3 Harris Award for innovation and user-centric design among 50+ teams.",
    },
    technical: {
      architecture: "React interface connects user inputs to an OpenAI-powered chatbot through custom health-focused prompts.",
      decisions: "Balanced clear UI flows with informative generated output and approachable user interactions.",
      depth: "Implemented the frontend and prompt integration under hackathon time constraints as team lead.",
    },
  },
  {
    title: "Ivy Journey Web Platform",
    domain: "Web Development",
    role: "Technology lead and web developer",
    stack: ["Web Development", "SEO", "Analytics", "Responsive Design"],
    links: [
      {
        label: "Website",
        href: "https://www.theivyjourney.com/",
      },
    ],
    impact: {
      problem: "Modernize a client-facing education company website and online services for discoverability and conversion.",
      audience: "Prospective Ivy Journey clients evaluating services online.",
      outcome: "Produced 100+ daily views, a 150%+ client increase, 20% higher discoverability, and 90% lower load time.",
    },
    technical: {
      architecture: "Built responsive web services with analytics instrumentation, SEO improvements, and performance optimization.",
      decisions: "Prioritized fast load times, mobile usability, and conversion-oriented information architecture.",
      depth: "Owned web development and technical leadership across site functionality, optimization, and online service delivery.",
    },
  },
];
