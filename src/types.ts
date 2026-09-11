export type Project = {
  id: string; // "sehat-ai" — url-safe, permanent
  name: string; // "Sehat AI: Autonomous Health Agent"
  folder: string; // "AUTONOMOUS_AGENTS" — drives the Explorer tree, shown as a DIR path
  quote: string; // the witty one-liner under the title
  description: string; // the single body paragraph
  featured: boolean; // shows in the desktop rail
  repo?: string; // GitHub URL. Empty/omitted if none.
  shots?: string[]; // paths under /public/shots/<id>/*
  video?: string; // path or URL
};

export type ContentLinks = {
  github: string;
  linkedin: string;
  email: string;
};

export type SkillGroup = [category: string, items: string[]];

export type Content = {
  name: string;
  role: string;
  tagline: string;
  /** Typed out on the post-intro "Hi, I am ..." screen — distinct copy from the splash tagline. */
  heroTagline: string;
  links: ContentLinks;
  aboutIntro: string[]; // the WHOAMI paragraphs
  sysSpecs: [label: string, detail: string][]; // the "> SYS_SPECS" block
  skills: SkillGroup[];
  projects: Project[];
};
