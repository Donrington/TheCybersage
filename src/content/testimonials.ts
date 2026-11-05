// Real testimonials, quotes transcribed from the screenshots in /public/testimonial. Do not edit wording.

export type Source = 'Client' | 'LinkedIn' | 'Upwork';

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
  /** White company logo in /public/logo — omitted for peer endorsements */
  logo?: string;
  /** Scale-up factor for logos with heavy internal whitespace */
  logoScale?: number;
  source: Source;
}

/* Real testimonials — quotes transcribed from the source screenshots in /public/testimonial */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Hycinth',
    role: 'Chief Executive Officer',
    company: 'SAMDUS Oil & Gas',
    quote:
      'It has been quite a pleasure and delightful experience working with you. Your professionalism, dedication, commitment, enthusiasm, passion, and especially patience are all commendable.',
    image: '/testimonial/samdus.jpg',
    logo: '/logo/samdus_white.png',
    source: 'Client',
  },
  {
    name: 'Carita',
    role: 'Founder',
    company: 'RecoverDerm',
    quote:
      'The website is beautiful — already I’m getting a lot of compliments. I’m happy and proud we were able to bring my vision to light.',
    image: '/testimonial/recoverderm.jpg',
    logo: '/logo/ReCoverDerm Logo Varient (White).png',
    source: 'Client',
  },
  {
    name: 'Halima',
    role: 'Executive Director',
    company: 'AmaniGo Travel',
    quote:
      'Cybersage delivered a top-notch CMS for our travel agency. It’s user-friendly and has genuinely enhanced our client engagement.',
    image: '/testimonial/amanigo.png',
    logo: '/logo/amanigo.png',
    logoScale: 2,
    source: 'Client',
  },
  {
    name: 'Godspower Lawrence',
    role: 'Software Engineer',
    company: 'Endorsement · LinkedIn',
    quote:
      'I was consistently impressed by his exceptional Python skills, dedication, and attention to detail. He excels at solving complex problems with a systematic approach and collaborates effectively within a team. He is an asset to any team.',
    image: '/testimonial/lawerence_linkedin.jpg',
    source: 'LinkedIn',
  },
  {
    name: 'Precious Ukasoanya',
    role: 'Fullstack Software Engineer',
    company: 'Endorsement · LinkedIn',
    quote:
      'Carrington possesses an in-depth understanding of Python, consistently delivering high-quality code with a keen eye for detail. A great team player who communicates effectively — I wholeheartedly endorse him.',
    image: '/testimonial/preciousLinkedIn.jpg',
    source: 'LinkedIn',
  },
  {
    name: 'Ashley J.',
    role: 'Software Engineer',
    company: 'Verified · Upwork',
    quote:
      'He consistently delivered quality work on time, communicated effectively, and demonstrated strong technical skills in Python. Professional, reliable, and easy to work with. Highly recommended.',
    image: '/testimonial/ashley_upwork.jpg',
    source: 'Upwork',
  },
];
