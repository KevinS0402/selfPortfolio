export const chapters = [
  { number: "01", title: "Engineering & AI", description: "Software, applied AI, and product decisions.", href: "/engineering/", label: "Engineering" },
  { number: "02", title: "Leadership & Impact", description: "STEM education, service, and community.", href: "/impact/", label: "Impact" },
  { number: "03", title: "About", description: "Vanderbilt, New York, and the creative side.", href: "/about/", label: "About" },
] as const;

export type CaseStudySection = { title: string; paragraphs: string[] };
export type ArchitectureStep = { title: string; detail: string; explanation: string };
export const engineeringThemes: ArchitectureStep[] = [
  { title: "Music & creativity", detail: "Where sound meets software", explanation: "SongSearch brings my interests in music and engineering together: audio processing, cloud inference, and tools that give artists more context for their creative decisions." },
  { title: "Accessibility", detail: "Useful on accessible hardware", explanation: "With SignLect, I explored real-time sign detection on a Raspberry Pi. The challenge connects computer vision with the practical constraints of affordable classroom hardware." },
  { title: "Applied AI", detail: "From model output to something useful", explanation: "Across emergency-information retrieval, research software, and product work at Elysian, I’m interested in how AI fits into a useful workflow—and where human judgment still matters." },
  { title: "Web & product", detail: "The interface is part of the engineering", explanation: "From Ivy Journey’s website and online services to this portfolio, I build interfaces and supporting systems with usability, performance, and the person on the other side in mind." },
];

export type FeaturedProject = {
  slug: string; title: string; summary: string; purpose: string; audience: string; role: string; stack: string[];
  motif: "about" | "camera" | "weather" | "browser";
  secondary?: boolean;
  architecture: ArchitectureStep[]; sections: CaseStudySection[];
  links: { label: string; href: string }[]; privateNote?: string;
};

// Adapted from the original projects.ts. Original quantitative claims remain there
// for verification; purpose, audience, architecture, and implementation are restored here.
export const featuredProjects: FeaturedProject[] = [
  {
    slug: "songsearch", title: "SongSearch", summary: "AI music analysis for originality, quality, and marketability.",
    purpose: "Help artists and teams verify song originality before release using automated music analysis.",
    audience: "Musicians, producers, and music teams evaluating originality, quality, and marketability.",
    role: "Independent project", motif: "about", stack: ["React", "TypeScript", "Firebase", "Cloud Run", "Bun"],
    architecture: [
      { title: "Upload", detail: "React + Firebase", explanation: "The musician uploads an audio file through the React interface. Firebase supports the storage and database layer." },
      { title: "Extract", detail: "Audio processing", explanation: "The pipeline extracts audio features for analysis, requiring no additional user input beyond the uploaded file." },
      { title: "Analyze", detail: "Cloud Run inference", explanation: "Cloud Run inference services combine lyrical identification, motif repetition, rhythmic predictability, harmonic tension, and information-theoretic metrics." },
      { title: "Results", detail: "Originality + quality", explanation: "The upload-only workflow returns ML-driven originality and quality signals for musicians and music teams to consider before release." },
    ],
    sections: [
      { title: "Purpose & audience", paragraphs: ["Help artists and teams verify song originality before release using automated music analysis.", "Built for musicians, producers, and music teams evaluating originality, quality, and marketability."] },
      { title: "What I built", paragraphs: ["A React and TypeScript frontend connected to Firebase storage and database services, with Cloud Run inference for audio extraction and analysis.", "I designed the end-to-end extraction and inference pipeline around an upload-only workflow, returning ML-driven originality and quality signals."] },
      { title: "Decisions & tradeoffs", paragraphs: ["I combined information-theoretic metrics with lyrical identification, motif repetition, rhythmic predictability, and harmonic tension.", "Keeping file upload as the only required input makes the tool approachable. Bringing several musical signals together provides more context than relying on one measure of originality."] },
      { title: "Outcomes & limitations", paragraphs: ["Built an end-to-end cloud music-analysis workflow and documented its architecture in the public case study.", "Originality and quality still require musical judgment. The analysis provides signals rather than a definitive creative verdict."] },
    ],
    links: [{ label: "GitHub case study", href: "https://github.com/KevinS0402/SongSearchCaseStudy" }],
  },
  {
    slug: "signlect", title: "SignLect", summary: "Real-time ASL sign detection on affordable classroom hardware.",
    purpose: "Make American Sign Language detection more accessible in educational settings.",
    audience: "Students with hearing impairments and educators using affordable classroom hardware.",
    role: "Independent project", motif: "camera", stack: ["Python", "PyTorch", "YOLO", "Ultralytics", "Raspberry Pi"],
    architecture: [
      { title: "Capture", detail: "Camera input", explanation: "A camera supplies input to the real-time sign-detection pipeline." },
      { title: "Detect", detail: "Custom YOLO model", explanation: "A custom YOLO model trained with PyTorch on open-source ASL datasets detects signs in camera input." },
      { title: "Deploy", detail: "Raspberry Pi 5", explanation: "The model is optimized for Raspberry Pi 5, bringing the detection pipeline onto affordable edge hardware." },
      { title: "Output", detail: "Sign detection", explanation: "The device returns detected signs. This project focuses on sign recognition; full language translation is a broader problem." },
    ],
    sections: [
      { title: "Purpose & audience", paragraphs: ["Make American Sign Language detection more accessible in educational settings.", "Built with students with hearing impairments and educators using affordable classroom hardware in mind."] },
      { title: "What I built", paragraphs: ["Camera input runs through a custom YOLO model on Raspberry Pi 5 for real-time sign detection.", "I trained the model with PyTorch on Google Colab GPUs using open-source ASL datasets, then optimized deployment for the target device."] },
      { title: "Decisions & tradeoffs", paragraphs: ["Model compression and hardware-aware deployment shaped the project, with responsiveness and affordability central to the classroom use case.", "Training on GPU hardware and running on a Raspberry Pi impose different constraints. Inference needs to be evaluated on the device where the system will actually run."] },
      { title: "Outcomes & limitations", paragraphs: ["Built and optimized an edge-deployed sign-detection pipeline on Raspberry Pi 5.", "Recognizing signs does not amount to general ASL translation. Dataset coverage and differences in signing styles remain important limits. A model walkthrough and selected source excerpts are available on request."] },
    ], links: [], privateNote: "Private repository; model walkthrough and selected source excerpts available upon request.",
  },
  {
    slug: "canary-ai", title: "Canary.ai", summary: "Local news, social updates, and weather alerts in one emergency-information app.",
    purpose: "Help people find critical, location-specific emergency information faster during severe weather events.",
    audience: "Local residents who need relevant news, social updates, weather alerts, and live notifications during emergency conditions.",
    role: "Vanderbilt CS capstone · Team lead", motif: "weather", stack: ["React Native", "Bun", "Supabase", "Vector embeddings", "NWS API"],
    architecture: [
      { title: "Sources", detail: "News + social + NWS", explanation: "The app brings together local news, location-relevant social posts, and alerts from the National Weather Service." },
      { title: "Retrieve", detail: "Supabase + embeddings", explanation: "Supabase-backed search and semantic vector embeddings support retrieval of relevant incoming information." },
      { title: "Filter", detail: "Location relevance", explanation: "Relevance filtering focuses the incoming information on the user’s location rather than showing every update." },
      { title: "Notify", detail: "React Native app", explanation: "Live update notifications bring relevant emergency information into the React Native mobile experience." },
    ],
    sections: [
      { title: "Purpose & audience", paragraphs: ["Help people find critical, location-specific emergency information faster during severe weather events.", "Built for local residents who need relevant news, social updates, weather alerts, and live notifications during emergency conditions."] },
      { title: "What I built", paragraphs: ["I led the capstone team building a React Native and Bun mobile app backed by Supabase search for live emergency-information retrieval.", "The app aggregates local news, location-relevant social posts, and National Weather Service alerts, with live update notifications. We presented the project at Vanderbilt’s CS Senior Symposium."] },
      { title: "Decisions & tradeoffs", paragraphs: ["We integrated semantic vector embeddings to filter incoming local news, social posts, and NWS alerts by user-location relevance.", "Filtering by relevance makes the volume of information more manageable. Because the sources differ, freshness and reliability need to remain visible rather than treating every update as equivalent."] },
      { title: "Outcomes & limitations", paragraphs: ["Delivered the capstone mobile app and presented its approach at Vanderbilt’s CS Senior Symposium. The repository and symposium poster provide implementation detail.", "The usefulness of the app depends on source freshness, retrieval relevance, and notification reliability. It complements the underlying sources of emergency information."] },
    ],
    links: [{ label: "GitHub", href: "https://github.com/KevinS0402/Canary.ai" }, { label: "Symposium poster", href: "https://drive.google.com/file/d/1dFMBtkJUpEBkNZdVTDllYQCR3ce0_pZx/view?usp=sharing" }],
  },
  {
    slug: "aihealth", title: "AIHealth", secondary: true,
    summary: "A hackathon prototype for fitness and meal-planning conversations.",
    purpose: "Explore conversational AI for personalized workout and meal ideas.",
    audience: "People looking for a starting point for fitness routines and meal planning.",
    role: "VandyHacks X · Team lead / frontend & prompt integration", motif: "browser",
    stack: ["React", "JavaScript", "HTML / CSS", "OpenAI / GPT-3.5"],
    architecture: [
      { title: "Choose", detail: "Fitness or meals", explanation: "The prototype offers two conversations: an AI fitness trainer and an AI meal planner." },
      { title: "Context", detail: "User inputs", explanation: "The conversation asks for personal context and, for meal planning, cooking experience to inform its suggestions." },
      { title: "Prompt", detail: "GPT-3.5 integration", explanation: "Task-specific prompts guide the ChatGPT integration toward workout plans or meal ideas." },
      { title: "Respond", detail: "Conversational interface", explanation: "The web interface displays the generated response progressively, as documented in the original project write-up." },
    ],
    sections: [
      { title: "What I built", paragraphs: ["I led the hackathon team, built the React interface, and worked on integrating an OpenAI-powered chatbot with prompts for fitness and meal planning.", "Our prototype brought two task-specific conversations into a web experience with progressively displayed responses."] },
      { title: "Purpose & audience", paragraphs: ["We wanted to make the first step toward planning a workout or a meal less overwhelming. The prototype used conversational input to suggest a personalized starting point."] },
      { title: "Decisions & tradeoffs", paragraphs: ["We adapted an existing ChatGPT wrapper and focused on two clear use cases within the hackathon timeframe. Understanding the wrapper and connecting its behavior to the interface was a central integration challenge."] },
      { title: "Outcomes & limitations", paragraphs: ["The team completed a working hackathon prototype. The public write-up and repository document the original implementation and what we learned about integrating React, JavaScript, and AI responses.", "This was an exploratory project. A functioning chatbot does not establish the accuracy or suitability of its health-related suggestions, and the original write-up describes public hosting and a mobile app as future plans."] },
    ],
    links: [{ label: "Devpost", href: "https://devpost.com/software/happy-health-irg7fd" }, { label: "GitHub", href: "https://github.com/KevinS0402/VHX" }],
  },
];

export type Experience = { name: string; position: string; focus: string; dates?: string; current?: boolean; description: string; detail: string; skills: string[]; link?: { label: string; href: string } };
export const experiences: Experience[] = [
  {
    name: "Elysian", position: "Software Engineering & Product Management Intern", dates: "Aug 2026 – Present",
    focus: "Agentic AI · Product development", current: true,
    description: "I work across software engineering and product management on AI-powered insurance tools.",
    detail: "I initiate user conversations, translate feedback into product improvements, and contribute hands-on engineering within a cross-functional team. I helped ship an initial iteration for user testing.",
    skills: ["Agentic AI", "Customer discovery", "Software engineering", "Product management"],
  },
  {
    name: "Ivy Journey", position: "Technology Lead", dates: "Aug 2022 – Present",
    focus: "Full-stack development · Design · AI integration",
    description: "I lead full-stack development, website design, and AI integration for a college admissions consulting company.",
    detail: "Built a chatbot with company knowledge and response guardrails, migrated Wix to Vercel, and integrated Resend. The work contributed to 150% client growth and 20% higher conversion; page-load time fell by 90%.",
    skills: ["Full-stack", "AI chatbot", "Vercel", "Resend", "SEO / LLM discovery"],
    link: { label: "Visit website", href: "https://www.theivyjourney.com/" },
  },
  { name: "NIST", position: "Software Engineering Intern", dates: "Jun 2026 – Aug 2026", focus: "SimPROCESD research tooling", description: "Built interactive software to help NIST researchers visualize and analyze data for Industrial AI simulation environments.", detail: "Combined a PySide6 interface, NumPy-backed calculations, and Matplotlib visualization dashboards. Prioritized intuitive graphing, reproducible simulations, and maintainable open-source repository structure.", skills: ["Python", "NumPy", "PySide6", "Matplotlib", "Git"], link: { label: "SURF presentation", href: "https://drive.google.com/file/d/1dKzmMHg8W1KJuIwIzQ0t8eQo-AhPnSbn/view?usp=sharing" } },
  { name: "Handshake MOVE", position: "AI Model Validation Fellow", dates: "Jun 2025 – Present", focus: "AI evaluation", description: "Strengthened AI model behavior through dataset curation, output evaluation, and human-aligned validation.", detail: "Reviewed model outputs and website features against human intent, usability, and domain-specific quality criteria. Built judgment around supervised-learning data quality and evaluation rubrics.", skills: ["Dataset curation", "Model evaluation", "QA", "Human feedback"] },

];

export type ImpactInitiative = { title: string; context: string; motif: "classroom" | "toolkit" | "studio"; summary: string; details: string[]; links: { label: string; href: string }[] };
export const impactInitiatives: ImpactInitiative[] = [
  { title: "DevelopIT", context: "Co-founder · STEM education", motif: "classroom" as const,
    summary: "Co-founded a STEM education nonprofit providing pro-bono computer science lessons to underserved students.",
    details: ["Partnered with schools to teach Python, Java, web design, robotics, AI, machine learning, and cybersecurity.", "Built the nonprofit’s digital marketing strategy to expand brand awareness across school districts."], links: [{ label: "Visit DevelopIT", href: "https://www.developitinc.org/" }] },
  { title: "MNPS / Save The Music", context: "Ingram-funded · Music education", motif: "toolkit" as const,
    summary: "Led an initiative to address technology gaps for music educators through a Vanderbilt Ingram Scholarship-funded project.",
    details: ["Developed an implementation toolkit to support district music program expansion and educator onboarding at Metro Nashville Public Schools.", "Worked at the intersection of technology, program development, and music education through an initiative funded by the Ingram Scholarship."], links: [{ label: "Read the summer project (PDF)", href: "https://cdn.vanderbilt.edu/vu-wpfsx/wp-content/uploads/sites/60/2026/08/Kevin-Song-Updated-Ingram-Summer-Project-2-Pager.pdf" }] },
  { title: "Vanderbilt Recording Studio", context: "Studio leadership · Creative community", motif: "studio" as const,
    summary: "Oversaw studio operations and led a multidisciplinary student team.",
    details: ["Hosted recording sessions and community events, supporting students as they wrote, recorded, and produced music.", "Spearheaded the studio’s marketing presence to bring more of Vanderbilt’s creative community into the space."], links: [{ label: "Visit the recording studio", href: "https://vanderbiltrecording.studio/" }] },
];
