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
        label: "GitHub Case Study",
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
    title: "Canary.ai",
    domain: "Emergency Tech / AI",
    role: "Vanderbilt Senior CS Capstone Project",
    stack: [
      "React Native",
      "Bun",
      "Supabase",
      "Vector Embeddings",
      "National Weather Service API",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/KevinS0402/Canary.ai",
      },
      {
        label: "Poster",
        href: "https://drive.google.com/file/d/1dFMBtkJUpEBkNZdVTDllYQCR3ce0_pZx/view?usp=sharing",
      },
    ],
    impact: {
      problem:
        "Help people find critical, location-specific emergency information faster during severe weather events.",
      audience:
        "Local residents who need relevant news, social updates, weather alerts, and live notifications during emergency conditions.",
      outcome:
        "Led a 3-member team to aggregate local news, location-relevant social posts, and National Weather Service alerts, reducing critical weather information access time by 70%.",
    },
    technical: {
      architecture:
        "Built a React Native and Bun mobile app backed by Supabase search for live emergency information retrieval.",
      decisions:
        "Integrated semantic vector embeddings to filter incoming local news, social posts, and NWS alerts by user-location relevance.",
      depth:
        "Delivered live update notifications and presented the project at Vanderbilt's annual CS Senior Symposium.",
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
    domain: "Web & AI Product",
    role: "Technology Lead",
    stack: ["Full-stack development", "AI chatbot", "Vercel", "Resend", "SEO / LLM discoverability"],
    links: [
      {
        label: "Website",
        href: "https://www.theivyjourney.com/",
      },
    ],
    impact: {
      problem: "Help prospective students and families understand admissions services through a trustworthy, approachable digital experience.",
      audience: "Prospective students and families evaluating Ivy Journey’s admissions consulting services.",
      outcome: "Contributed to 150% client growth and 20% higher customer conversion. Reduced page-load time by 90%.",
    },
    technical: {
      architecture: "Built a full-stack website with a company-knowledge-grounded AI chatbot, response guardrails, and Resend email workflows; migrated hosting from Wix to Vercel.",
      decisions: "Designed around customer trust and clear service discovery, improved search engine and LLM discoverability, and kept chatbot usage within free-tier limits.",
      depth: "Led full-stack development, branding and website design, performance optimization, and infrastructure modernization, including a hosting migration that reduced recurring costs.",
    },
  },
];
