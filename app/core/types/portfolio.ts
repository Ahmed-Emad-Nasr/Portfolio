export interface ContactInfo {
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  location: string;
  whatsapp: string;
  youtube: string;
  instagram: string;
  x: string;
}

export interface HeroSpec {
  label: string;
  value: string;
}

export interface HeroInfo {
  tagline: string;
  japaneseTagline: string;
  /** The "Technical Specifications" strip in the hero */
  specs: HeroSpec[];
  photo: string;
  cvUrl: string;
}

export interface Profile {
  name: string;
  title: string;
  japaneseTitle: string;
  availability: string;
  /** The areas on the hero's "Focus" row */
  focus: string[];
  /** The jobs typed one after another under the name in the hero */
  roles: string[];
  contact: ContactInfo;
  hero: HeroInfo;
}

export interface Experience {
  company: string;
  link: string;
  role: string;
  japaneseRole?: string;
  kind?: "work" | "volunteer" | "education";
  location: string;
  period: string;
  description: string;
  details: string[];
  isEducation?: boolean;
}

export interface ProjectHighlight {
  name: string;
  type: string;
  description: string;
  metrics: string[];
  link: string;
  githubRepo?: string;
  proofUrl?: string;
}

export interface ProjectsData {
  githubUsername: string;
  pinnedRepos: string[];
  highlights: ProjectHighlight[];
}

export type WorkType = "lab" | "tool" | "research" | "platform";

export interface WorkLink {
  github?: string;
  live?: string;
  playStore?: string;
  appStore?: string;
  docs?: string;
  caseStudy?: string;
  demo?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  type: WorkType;
  tagline: string;
  problem: string;
  role: string;
  stack: string[];
  platform: string;
  status: "live" | "private-demo" | "open-source";
  year: string;
  links: WorkLink;
  metrics: string[];
  featured?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  japanese: string;
  description: string;
  stack: string[];
  deliverable: string;
}

export interface StackGroup {
  id: string;
  title: string;
  japanese: string;
  items: string[];
}

export interface ProcessStep {
  id: string;
  index: string;
  title: string;
  japanese: string;
  description: string;
}

export interface Certificate {
  title: string;
  /** Short mark shown on the card's seal panel when there is no scan (eJPT, CCNA …) */
  mark: string;
  issuer: string;
  date: string;
  kind: "certification" | "award";
  image?: string;
  link?: string;
}

export interface ArtGalleryItem {
  src: string;
  thumb: string;
  title: string;
}

export interface Contribution {
  name: string;
  org: string;
  description: string;
  link: string;
}

export interface Stat {
  target: number;
  suffix: string;
  label: string;
  japanese: string;
}

export interface Language {
  code: string;
  name: string;
  level: string;
}

export interface UsesGroup {
  id: string;
  title: string;
  japanese: string;
  items: string[];
}

export interface NowItem {
  label: string;
  detail: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Milestone {
  year: string;
  title: string;
  detail: string;
}

export interface PortfolioData {
  profile: Profile;
  experience: Experience[];
  projects: ProjectsData;
  work: WorkItem[];
  services: ServiceItem[];
  stack: StackGroup[];
  process: ProcessStep[];
  contributions: Contribution[];
  languages: Language[];
  certificates: Certificate[];
  artGallery: ArtGalleryItem[];
  uses: UsesGroup[];
  milestones: Milestone[];
}
