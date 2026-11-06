// Certifications, newest first. Shown in About and mirrored in the JSON-LD in layout.tsx.

export interface Certification {
  title: string;
  issuer: string;
  year: string;
  file: string;
}

export const CERTIFICATIONS: Certification[] = [
  { title: 'Software Development', issuer: 'TS Academy', year: '2026', file: '/certificates/TS_Academy_Certificate.png' },
  { title: 'Full Stack Engineering', issuer: 'IBT Learning', year: '2025', file: '/certificates/Carrington Abakwe - 2025-08-04 - Full stack engineering Certificate (IBT Learning).pdf' },
  { title: 'Web Development Internship', issuer: 'Zidio Development', year: '2024', file: '/certificates/Zidio Development - Web Devlopment Internship.jpeg' },
  { title: 'Web Application Development', issuer: 'Moat Academy', year: '2023', file: '/certificates/Abakwe Carrington - Web application development (Moat Academy).jpeg' },
];
