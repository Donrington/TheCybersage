import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SoundLab } from './SoundLab';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sound lab',
  robots: { index: false, follow: false },
};

/** Development-only audition page for every site sound. Does not exist in production. */
export default function SoundLabPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <SoundLab />;
}
