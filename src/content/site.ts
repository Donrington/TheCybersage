// Site copy in one place. Edit wording here, not in components.
// Rule: headings are full statements in one typeface (Satoshi). The Instrument
// Serif italic appears exactly once on the page, in the hero line. Every claim
// here must already be true elsewhere on the site (no new numbers, no new clients).

export const POSITIONING =
  'Engineer who architects and designs the system behind the screen.';

/** Primary navigation: five links plus the Hire me button. Everything else lives in the footer. */
export const NAV_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Pricing', href: 'https://cybersage.dev/pricing' },
  { label: 'Contact', href: '#contact' },
] as const;

/** Links moved out of the main nav. Rendered in the footer. */
export const FOOTER_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Systems', href: '#systems' },
  { label: 'About', href: '#about' },
  { label: 'Credentials', href: '#credentials' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'FAQ', href: '#faq-section' },
  { label: 'Pricing', href: 'https://cybersage.dev/pricing' },
  { label: 'Contact', href: '#contact' },
] as const;

/**
 * Section labels (small, above the heading) and headings.
 * Labels replace the old numbered "01 / ABOUT" eyebrows, which were also
 * out of order (07 twice) and won't survive the section reorder.
 */
export const SECTIONS = {
  about: { label: 'About', heading: 'I build the system behind the screen.' },
  work: { label: 'Selected work', heading: 'Shipped for real clients, still running.' },
  stack: { label: 'Technologies', heading: 'The stack behind every build.' },
  services: { label: 'Services', heading: 'Five things I get hired to build.' },
  process: { label: 'Process', heading: 'From first call to launch, in four steps.' },
  lab: { label: 'Lab', heading: 'Also in the works.' },
  systems: { label: 'Under the hood', heading: 'Seven layers of a production system.' },
  credentials: { label: 'Credentials', heading: 'The résumé, certificates and public activity.' },
  testimonials: { label: 'Testimonials', heading: 'What clients and teammates say.' },
  faq: { label: 'FAQ', heading: 'Questions people ask before hiring me.' },
  pricing: { label: 'Pricing', heading: 'Prices, published up front.' },
  contact: { label: 'Contact', heading: "Have a project in mind? Let's talk." },
} as const;

export type SectionKey = keyof typeof SECTIONS;
