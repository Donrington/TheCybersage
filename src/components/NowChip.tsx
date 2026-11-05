import now from '@/data/now.json';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function sinceLabel(since?: string | null) {
  const m = since?.match(/^(\d{4})-(\d{2})$/);
  return m ? `since ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : null;
}

/** First entry in src/data/now.json with status "building". Renders nothing if there is none. */
export function NowChip() {
  const entry = now.entries.find((e) => e.status === 'building');
  if (!entry) return null;
  const since = sinceLabel(entry.since);
  return (
    <a
      href="#lab"
      className="group inline-flex min-h-11 items-center gap-3 self-start border border-white/15 bg-[#0A0A0A]/60 px-4 backdrop-blur-sm transition-colors duration-200 hover:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:self-auto"
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden>
        <span className="absolute inset-0 animate-ping rounded-full bg-live/60 motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 rounded-full bg-live" />
      </span>
      <span className="t-label text-on-ink-3">Now building</span>
      <span className="text-sm font-semibold text-white">{entry.project}</span>
      <span className="t-label hidden text-on-ink-3 md:inline">
        {entry.client}
        {since ? ` · ${since}` : ''}
      </span>
    </a>
  );
}
