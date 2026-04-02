import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { serviceCatalog } from "@/app/core/data";
import ServicePageTracker from "./ServicePageTracker";
import ServiceActions from "./ServiceActions";

type ServicePageParams = {
  slug: string;
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
        <p className={styles.kicker}>Service Brief</p>
        <h1 className={styles.title}>{item.title}</h1>
        <p className={styles.description}>{item.description}</p>

        <div className={styles.metaRow}>
          <span className={styles.metaPill}>From {item.from}</span>
          <span className={styles.metaPill}>Expected outcome: {item.outcome}</span>
        </div>

        <section className={styles.card}>
          <h2>What You Receive</h2>
          <ul className={styles.list}>
            {item.deliverables.map((deliverable) => (
              <li key={deliverable}>{deliverable}</li>
            ))}
          </ul>
        </section>

        <ServiceActions slug={item.slug} />
      </div>
    </main>
  );
}
