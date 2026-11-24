'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { CUES, sfx, type CueName, type PlayOpts } from '@/lib/sound';
import { SoundToggle } from '@/components/SoundToggle';

const NAMES = Object.keys(CUES) as CueName[];

const BTN =
  't-mono cursor-pointer border border-white/30 px-2 py-2 text-left text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="t-mono flex items-center gap-2 text-on-ink-2">
      <span className="shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1 cursor-pointer accent-white"
      />
      <span className="w-10 shrink-0 text-right tabular-nums text-white">{Number.isInteger(step) ? value : value.toFixed(2)}</span>
    </label>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-on-ink-line">
      <h2 className="t-mono border-b border-on-ink-line px-3 py-2 uppercase tracking-[0.16em] text-on-ink-3">{title}</h2>
      <div className="flex flex-col gap-3 p-3">{children}</div>
    </section>
  );
}

export function SoundLab() {
  const status = useSyncExternalStore(sfx.subscribe, sfx.getStatus, () => 'locked' as const);

  const [volume, setVolume] = useState(1);
  const [layerDeg, setLayerDeg] = useState(0);
  const [detentDeg, setDetentDeg] = useState(0);
  const [pencilDur, setPencilDur] = useState(1.3);
  const [whooshDur, setWhooshDur] = useState(0.5);
  const [whooshDir, setWhooshDir] = useState<1 | -1>(1);
  const [scrollDur, setScrollDur] = useState(1);

  const [loaderP, setLoaderP] = useState(0);
  const [buzzLevel, setBuzzLevel] = useState(0);
  const [dragReadout, setDragReadout] = useState('idle');

  const loaderOn = useRef(false);
  const buzzRef = useRef(0);
  const buzzTimer = useRef(0);
  const seqTimers = useRef<number[]>([]);
  const dragging = useRef(false);
  const lastPt = useRef({ x: 0, y: 0, t: 0 });

  // The audio graph only exists once unlocked, so apply the volume again when the status changes.
  useEffect(() => {
    sfx.setVolume(volume);
  }, [volume, status]);

  // Leave nothing running when the page goes away.
  useEffect(() => {
    const timers = seqTimers.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
      window.clearInterval(buzzTimer.current);
      sfx.buzz(0);
      sfx.loaderStop();
    };
  }, []);

  const play = (name: CueName) => {
    const o: PlayOpts = {};
    if (name === 'layer') o.deg = layerDeg;
    else if (name === 'detent') o.deg = detentDeg;
    else if (name === 'pencil') o.dur = pencilDur;
    else if (name === 'whoosh') {
      o.dur = whooshDur;
      o.dir = whooshDir;
    } else if (name === 'scrollTop') o.dur = scrollDur;
    sfx.play(name, o);
  };

  const extra = (name: CueName): ReactNode => {
    switch (name) {
      case 'layer':
        return <Range label="deg" value={layerDeg} min={0} max={6} step={1} onChange={setLayerDeg} />;
      case 'detent':
        return <Range label="deg" value={detentDeg} min={0} max={9} step={1} onChange={setDetentDeg} />;
      case 'pencil':
        return <Range label="dur" value={pencilDur} min={0.2} max={3} step={0.05} onChange={setPencilDur} />;
      case 'scrollTop':
        return <Range label="dur" value={scrollDur} min={0.2} max={3} step={0.05} onChange={setScrollDur} />;
      case 'whoosh':
        return (
          <>
            <Range label="dur" value={whooshDur} min={0.2} max={2} step={0.05} onChange={setWhooshDur} />
            <button
              type="button"
              aria-pressed={whooshDir === 1}
              onClick={() => setWhooshDir((d) => (d === 1 ? -1 : 1))}
              className={`${BTN} py-1`}
            >
              dir: {whooshDir === 1 ? 'rising' : 'falling'}
            </button>
          </>
        );
      default:
        return null;
    }
  };

  /* loader drone */
  const moveLoader = (p: number) => {
    setLoaderP(p);
    if (!loaderOn.current) {
      loaderOn.current = true;
      sfx.loaderStart();
    }
    sfx.loaderProgress(p);
  };
  const liftLoader = () => {
    loaderOn.current = false;
    setLoaderP(0);
    sfx.loaderLift();
  };
  const stopLoader = () => {
    loaderOn.current = false;
    setLoaderP(0);
    sfx.loaderStop();
  };

  const playSequence = () => {
    seqTimers.current.forEach((id) => window.clearTimeout(id));
    seqTimers.current.length = 0;
    loaderOn.current = true;
    setLoaderP(0);
    sfx.loaderStart();
    const at = (ms: number, fn: () => void) => seqTimers.current.push(window.setTimeout(fn, ms));
    for (let i = 0; i < 7; i++) {
      at(120 * (i + 1), () => {
        sfx.play('layer', { deg: i });
        sfx.loaderProgress((i + 1) / 7);
        setLoaderP((i + 1) / 7);
      });
    }
    at(120 * 7 + 240, () => {
      loaderOn.current = false;
      setLoaderP(0);
      sfx.loaderLift();
    });
  };

  /* electrical buzz: sfx.buzz wants a call every frame while live */
  const moveBuzz = (v: number) => {
    setBuzzLevel(v);
    buzzRef.current = v;
    if (v > 0 && !buzzTimer.current) {
      buzzTimer.current = window.setInterval(() => sfx.buzz(buzzRef.current), 16);
    } else if (v === 0 && buzzTimer.current) {
      window.clearInterval(buzzTimer.current);
      buzzTimer.current = 0;
      sfx.buzz(0);
    }
  };

  /* paper drag pad */
  const padDown = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const padMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const now = performance.now();
    const last = lastPt.current;
    const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y);
    const speed = clamp(dist / Math.max(1, now - last.t) / 2, 0, 1);
    const r = e.currentTarget.getBoundingClientRect();
    const pos = clamp((e.clientX - r.left) / r.width, 0, 1);
    lastPt.current = { x: e.clientX, y: e.clientY, t: now };
    sfx.drag(speed, pos);
    setDragReadout(`speed ${speed.toFixed(2)}  pos ${pos.toFixed(2)}`);
  };
  const padUp = () => {
    dragging.current = false;
    setDragReadout('idle');
  };

  return (
    <div data-sound="off" className="min-h-screen bg-ink text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
        <header className="flex flex-col gap-3">
          <div className="t-mono flex items-center justify-between uppercase tracking-[0.16em] text-on-ink-3">
            <span>cybersage / sound lab</span>
            <span aria-live="polite">audio: {status}</span>
          </div>
          <p className="t-mono text-on-ink-1">Click anywhere first: browsers keep audio locked until a gesture.</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-9 items-stretch border border-on-ink-line">
              <SoundToggle variant="bar" className="border-l-0!" />
            </div>
            <div className="min-w-56 flex-1">
              <Range label="master" value={volume} min={0} max={1.5} step={0.01} onChange={setVolume} />
            </div>
          </div>
        </header>

        <Panel title="One-shot cues">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {NAMES.map((name) => (
              <div key={name} className="flex flex-col gap-2">
                <button type="button" onClick={() => play(name)} className={BTN}>
                  {name}
                </button>
                {extra(name)}
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Loader drone">
            <Range label="progress" value={loaderP} min={0} max={1} step={0.01} onChange={moveLoader} />
            <div className="flex gap-2">
              <button type="button" onClick={liftLoader} className={`${BTN} flex-1`}>
                loaderLift
              </button>
              <button type="button" onClick={stopLoader} className={`${BTN} flex-1`}>
                loaderStop
              </button>
            </div>
            <button type="button" onClick={playSequence} className={BTN}>
              Play the loader sequence
            </button>
          </Panel>

          <Panel title="Electrical buzz">
            <Range label="level" value={buzzLevel} min={0} max={1} step={0.01} onChange={moveBuzz} />
            <p className="t-mono text-on-ink-3">Calls sfx.buzz every 16 ms while the level is above 0. Drop it to 0 to let it die away.</p>
          </Panel>
        </div>

        <Panel title="Paper drag">
          <div
            role="application"
            aria-label="Drag pad. Press and move the pointer to scrape."
            onPointerDown={padDown}
            onPointerMove={padMove}
            onPointerUp={padUp}
            onPointerCancel={padUp}
            className="t-mono relative flex h-40 cursor-crosshair touch-none select-none items-end justify-between border border-dashed border-white/30 p-2 text-on-ink-3"
          >
            <span>drag here: speed sets loudness, left to right sets pitch</span>
            <span className="tabular-nums text-white">{dragReadout}</span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
