interface ContactInfo {
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

interface HeroSpec {
  label: string;
  value: string;
}

interface HeroInfo {
  tagline: string;
  japaneseTagline: string;
  /** The "Technical Specifications" strip in the hero */
  specs: HeroSpec[];
  photo: string;
  cvUrl: string;
}

interface Profile {
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
  /** A certificate from the gallery that proves the role */
  proof?: { label: string; href: string };
  /** Case-library filter with the work done in this role */
  cases?: { label: string; params: Record<string, string> };
}

interface ProjectHighlight {
  name: string;
  type: string;
  description: string;
  metrics: string[];
  link: string;
  githubRepo?: string;
  proofUrl?: string;
}

interface ProjectsData {
  githubUsername: string;
  pinnedRepos: string[];
  highlights: ProjectHighlight[];
}

export type WorkType = "lab" | "tool" | "research" | "platform";

interface WorkLink {
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

interface ServiceItem {
  id: string;
  title: string;
  japanese: string;
  description: string;
  stack: string[];
  deliverable: string;
}

interface StackGroup {
  id: string;
  title: string;
  japanese: string;
  items: string[];
  /** Case pages that show this group's skills in use */
  evidence?: { id: string; label: string }[];
}

interface ProcessStep {
  id: string;
  index: string;
  title: string;
  japanese: string;
  description: string;
}

interface ArtGalleryItem {
  src: string;
  thumb: string;
  title: string;
  description: string;
  category: string;
  keywords: readonly string[];
  creator: string;
}

interface Contribution {
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
  /** Where the number is proven: a section anchor or an external page */
  href?: string;
}

export interface Language {
  code: string;
  name: string;
  level: string;
}

interface UsesGroup {
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

interface Milestone {
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
  artGallery: ArtGalleryItem[];
  uses: UsesGroup[];
  milestones: Milestone[];
}
