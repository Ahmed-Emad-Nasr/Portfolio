/*
 * core/config/testimonials.ts
 *
 * What other people say — the one kind of proof a portfolio cannot produce
 * about itself. The section stays hidden until this list has at least one
 * entry, so it never shows up empty.
 *
 * Only real quotes, with permission, from someone a reader could check:
 * a LinkedIn recommendation is ideal (paste it and link it). Good sources:
 * a supervisor from the Banque Misr internship, an instructor at DEPI or ITI,
 * a student or the training manager at AMIT/NTI, a GDG organiser.
 *
 * Example:
 *   {
 *     quote: "Ahmed took a gap assessment from scoping to a remediation plan …",
 *     name: "Full Name",
 *     role: "Information Security Manager",
 *     org: "Banque Misr",
 *     link: "https://www.linkedin.com/in/ahmed-emad-nasr/details/recommendations/",
 *   },
 */

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  org: string;
  /** Where the quote can be verified (LinkedIn recommendation, post …) */
  link?: string;
};

export const testimonials: readonly Testimonial[] = [];
