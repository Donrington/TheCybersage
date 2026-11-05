/** Oversized two-voice type band: bold sans and italic serif, scrolling slowly. Pure CSS, paused for reduced motion. */
const ITEMS: [string, string][] = [
  ['Architect', 'systems'],
  ['Ship', 'reliably'],
  ['Scale', 'quietly'],
  ['Own', 'the whole stack'],
];

export function TypeBand() {
  const row = (
    <>
      {ITEMS.map(([a, b]) => (
        <span key={a} className="flex shrink-0 items-baseline gap-[0.3em] pr-[0.6em]">
          <span className="font-extrabold tracking-tighter">{a}</span>
          <span className="serif-i">{b}</span>
          <span aria-hidden className="pl-[0.3em] text-on-ink-3">✦</span>
        </span>
      ))}
    </>
  );
  return (
    <section aria-label="What I do" data-theme="dark" className="overflow-hidden border-t border-on-ink-line bg-[#0A0A0A] py-[clamp(2rem,5vw,4.5rem)] text-white">
      <div className="type-band flex w-max" style={{ fontSize: 'clamp(3.5rem, 11vw, 10rem)', lineHeight: 1 }} aria-hidden>
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
      <p className="sr-only">Architect systems. Ship reliably. Scale quietly. Own the whole stack.</p>
    </section>
  );
}
