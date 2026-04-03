import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { serviceCatalog } from "@/app/core/data";
import ServicePageTracker from "./ServicePageTracker";
import ServiceActions from "./ServiceActions";

type ServicePageParams = {
  slug: string;
};

const servicePlaybooks: Record<string, { problem: string; approach: string; miniCase: string; faq: Array<{ q: string; a: string }> }> = {
  "soc-analysis": {
    problem: "Alert overload and inconsistent triage often delay response and hide high-priority incidents.",
    approach: "I map noisy detections, tune correlation logic, and set a severity-first triage workflow aligned with MITRE ATT&CK.",
    miniCase: "In lab SOC operations, tuned rules and analyst workflow cut false positives by 25% and improved daily triage clarity.",
    faq: [
      { q: "How fast can SOC tuning start?", a: "Kickoff can start within 24 to 48 hours after access and scope confirmation." },
      { q: "Do you support existing SIEM stacks?", a: "Yes. Engagements are designed for existing Wazuh, ELK, or Splunk environments." },
    ],
  },
  "incident-response": {
    problem: "Teams lose time during incidents because containment and handoff steps are not clearly sequenced.",
    approach: "I build a practical incident timeline, define containment checkpoints, and document recovery decision points.",
    miniCase: "Across simulated attacks, structured handoffs improved response consistency and reduced investigation delays.",
    faq: [
      { q: "Do you provide post-incident documentation?", a: "Yes. You receive a timeline, root cause summary, and hardening recommendations." },
      { q: "Can this work remotely?", a: "Yes. Remote collaboration is supported with secure communication and reporting workflows." },
    ],
  },
  "threat-hunting": {
    problem: "Hidden threats remain undetected when teams rely only on alert-driven workflows.",
    approach: "I run hypothesis-based hunts, build detection logic, and validate signatures against expected telemetry.",
    miniCase: "Custom hunting routines increased practical detection coverage and reduced blind spots in daily monitoring.",
    faq: [
      { q: "Is threat hunting one-time or ongoing?", a: "Both are possible. Short assessments and recurring hunts are supported." },
      { q: "Will I receive reusable queries?", a: "Yes. Queries and detection notes are delivered for continued internal use." },
    ],
  },
  "siem-edr-implementation": {
    problem: "SIEM and EDR deployments often generate logs but fail to deliver reliable, actionable detections.",
    approach: "I deploy and validate a monitored pipeline, then prioritize high-impact detection rules for production use.",
    miniCase: "Hands-on SOC environments showed improved signal quality after baseline tuning and alert prioritization.",
    faq: [
      { q: "Do you support greenfield setup?", a: "Yes. Setup can start from architecture to validated detections and handover." },
      { q: "Can you tune existing deployment?", a: "Yes. Existing stacks can be tuned without rebuilding from scratch." },
    ],
  },
  "log-analysis-forensics": {
    problem: "Investigations stall when evidence is fragmented and IOC extraction is inconsistent.",
    approach: "I correlate logs, reconstruct timelines, and package IOCs in SIEM-ready format.",
    miniCase: "Structured forensic workflow improved investigation consistency and made evidence review faster.",
    faq: [
      { q: "What artifacts do you need?", a: "Available logs, host telemetry, and relevant context are enough to begin." },
      { q: "Do you provide executive summary?", a: "Yes. Technical findings and executive-ready summary are both included." },
    ],
  },
  vapt: {
    problem: "Security gaps remain unresolved without clear risk ranking and remediation sequencing.",
    approach: "I map findings to business impact, validate exploitability, and prioritize fixes with practical timelines.",
    miniCase: "Lab assessments improved remediation focus by ranking findings with impact-first prioritization.",
    faq: [
      { q: "Do you provide proof of concept details?", a: "Yes. Technical evidence is included with each validated finding." },
      { q: "Can this align with compliance needs?", a: "Yes. Findings can be formatted to support internal compliance workflows." },
    ],
  },
  "training-awareness": {
    problem: "Teams often know theory but lack repeatable incident-focused security behavior.",
    approach: "I deliver targeted sessions with practical labs and measurable learning outcomes.",
    miniCase: "35+ sessions delivered for 120+ learners with strong feedback and improved lab performance.",
    faq: [
      { q: "Can sessions be customized by team role?", a: "Yes. Content is tailored for technical and non-technical audiences." },
      { q: "Do you include exercises?", a: "Yes. Workshops include practical tasks and measurable participation outcomes." },
    ],
  },
  "malware-analysis": {
    problem: "Malware incidents escalate when behavior profiling and IOC packaging are delayed.",
    approach: "I perform controlled analysis, map persistence behavior, and ship detection-ready artifacts.",
    miniCase: "IOC packaging and behavior mapping improved response readiness for follow-up containment.",
    faq: [
      { q: "Will you provide YARA recommendations?", a: "Yes. Signature guidance and prevention controls are included." },
      { q: "Can artifacts be used in SIEM/EDR?", a: "Yes. Outputs are structured for operational ingestion workflows." },
    ],
  },
};

export function generateStaticParams() {
  return serviceCatalog.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }: { params: ServicePageParams }): Metadata {
  const item = serviceCatalog.find((service) => service.slug === params.slug);

  if (!item) {
    return {
      title: "Service Not Found | Ahmed Emad Nasr",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${item.title} | Ahmed Emad Nasr`,
    description: item.description,
    keywords: [
      item.title,
      "Cybersecurity service",
      "SOC",
      "Incident response",
      "Threat hunting",
      "Ahmed Emad Nasr",
    ],
    alternates: {
      canonical: `/services/${item.slug}`,
    },
    openGraph: {
      title: `${item.title} | Cybersecurity Service`,
      description: item.description,
      type: "article",
      url: `https://ahmed-emad-nasr.github.io/Portfolio/services/${item.slug}`,
      images: [
        {
          url: "/Assets/art-gallery/Images/logo/My_Logo.webp",
          width: 1200,
          height: 630,
          alt: `${item.title} service by Ahmed Emad Nasr`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | Ahmed Emad Nasr`,
      description: item.description,
      images: ["/Assets/art-gallery/Images/logo/My_Logo.webp"],
    },
  };
}

export default function ServiceDetailsPage({ params }: { params: ServicePageParams }) {
  const item = serviceCatalog.find((service) => service.slug === params.slug);

  if (!item) {
    notFound();
  }

  const playbook = servicePlaybooks[item.slug] ?? {
    problem: "Security outcomes can degrade without clear prioritization and actionable response steps.",
    approach: "I translate technical findings into execution-ready steps aligned to your environment and risk profile.",
    miniCase: "Engagement outcomes typically improve triage quality, response speed, and remediation focus.",
    faq: [
      { q: "Can this service start quickly?", a: "Yes. Most scopes can start within a short onboarding window." },
      { q: "Do you support remote collaboration?", a: "Yes. Delivery is remote-first with structured communication." },
    ],
  };

  const relatedServices = serviceCatalog.filter((service) => service.slug !== item.slug).slice(0, 3);

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `https://ahmed-emad-nasr.github.io/Portfolio/services/${item.slug}#service`,
        name: item.title,
        description: item.description,
        provider: {
          "@type": "Person",
          name: "Ahmed Emad Nasr",
          url: "https://ahmed-emad-nasr.github.io/Portfolio/",
        },
        areaServed: "Worldwide",
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: `https://ahmed-emad-nasr.github.io/Portfolio/services/${item.slug}`,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: item.from.replace("$", ""),
          availability: "https://schema.org/InStock",
          url: `https://ahmed-emad-nasr.github.io/Portfolio/services/${item.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://ahmed-emad-nasr.github.io/Portfolio/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://ahmed-emad-nasr.github.io/Portfolio/#Services",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: item.title,
            item: `https://ahmed-emad-nasr.github.io/Portfolio/services/${item.slug}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `https://ahmed-emad-nasr.github.io/Portfolio/services/${item.slug}#faq`,
        mainEntity: playbook.faq.map((entry) => ({
          "@type": "Question",
          name: entry.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.a,
          },
        })),
      },
    ],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />
      <ServicePageTracker slug={item.slug} />
      <div className={styles.container}>
        <p className={styles.kicker}>
          <Link href="/">Home</Link> / <Link href="/#Services">Services</Link> / <span>{item.title}</span>
        </p>
        <p className={styles.kicker}>Service Brief</p>
        <h1 className={styles.title}>{item.title}</h1>
        <p className={styles.description}>{item.description}</p>

        <div className={styles.metaRow}>
          <span className={styles.metaPill}>From {item.from}</span>
          <span className={styles.metaPill}>Expected outcome: {item.outcome}</span>
        </div>

        <section className={styles.card}>
          <h2>Problem We Solve</h2>
          <p className={styles.paragraph}>{playbook.problem}</p>
        </section>

        <section className={styles.card}>
          <h2>How We Deliver</h2>
          <p className={styles.paragraph}>{playbook.approach}</p>
        </section>

        <section className={styles.card}>
          <h2>What You Receive</h2>
          <ul className={styles.list}>
            {item.deliverables.map((deliverable) => (
              <li key={deliverable}>{deliverable}</li>
            ))}
          </ul>
        </section>

        <section className={styles.card}>
          <h2>Recent Outcome Snapshot</h2>
          <p className={styles.paragraph}>{playbook.miniCase}</p>
        </section>

        <section className={styles.card}>
          <h2>Common Questions</h2>
          <ul className={styles.faqList}>
            {playbook.faq.map((entry) => (
              <li key={entry.q}>
                <strong>{entry.q}</strong>
                <p className={styles.paragraph}>{entry.a}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card}>
          <h2>Explore Related Services</h2>
          <div className={styles.linkRow}>
            {relatedServices.map((service) => (
              <Link key={service.slug} className={styles.linkPill} href={`/services/${service.slug}`}>
                {service.title}
              </Link>
            ))}
            <Link className={styles.linkPill} href="/#Projects">See Project Highlights</Link>
          </div>
        </section>

        <ServiceActions slug={item.slug} />
      </div>
    </main>
  );
}
