'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CursorVariant = 'default' | 'link' | 'view' | 'drag' | 'hire' | 'ask' | 'text';

interface CursorConfig {
  dotSize:     number;
  ringSize:    number;
  ringFilled:  boolean;
  label:       string;
  borderWidth: number;
}

const CONFIGS: Record<CursorVariant, CursorConfig> = {
  default: { dotSize: 6,  ringSize: 38, ringFilled: false, label: '',       borderWidth: 1.5 },
  link:    { dotSize: 0,  ringSize: 54, ringFilled: false, label: '',       borderWidth: 1   },
  view:    { dotSize: 0,  ringSize: 78, ringFilled: true,  label: 'VIEW',   borderWidth: 0   },
  drag:    { dotSize: 0,  ringSize: 84, ringFilled: true,  label: 'DRAG',   borderWidth: 0   },
  hire:    { dotSize: 0,  ringSize: 78, ringFilled: true,  label: 'HIRE',   borderWidth: 0   },
  ask:     { dotSize: 0,  ringSize: 72, ringFilled: true,  label: 'ASK AI', borderWidth: 0   },
  text:    { dotSize: 2,  ringSize: 20, ringFilled: false, label: '',       borderWidth: 1   },
};

const SPRING_FAST = { type: 'spring' as const, stiffness: 800, damping: 38, mass: 0.3 };
const SPRING_RING = { type: 'spring' as const, stiffness: 200, damping: 26, mass: 0.6 };
const EASE        = [0.22, 1, 0.36, 1] as const;

function DragArrows({ color }: { color: string }) {
  return (
    <svg width="26" height="10" viewBox="0 0 26 10" fill="none" aria-hidden>
      <path
        d="M0 5H26M0 5L4.5 1M0 5L4.5 9M26 5L21.5 1M26 5L21.5 9"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CustomCursor() {
  const dotWrapRef  = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);

  // Only variant + isDark stay in React state — they change infrequently
  // (on element boundary crossings, not on every pixel).
  const [variant,  setVariant]  = useState<CursorVariant>('default');
  const [isDark,   setIsDark]   = useState(false);
  const [clicking, setClicking] = useState(false);
  // Decided once. This component is loaded with ssr:false, so window exists on
  // first render. Mouse + trackpad only, desktop widths, and not under reduced
  // motion (the lagging ring is motion). Everyone else keeps the native cursor.
  const [mounted] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      window.innerWidth >= 768 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const mouse      = useRef({ x: -400, y: -400 });
  const ringPos    = useRef({ x: -400, y: -400 });
  const rafRef     = useRef<number>(0);
  // Refs mirror state so RAF loop + event handlers read without stale closure
  const variantRef = useRef<CursorVariant>('default');
  const isDarkRef  = useRef(false);
  const clickingRef = useRef(false);

  useEffect(() => { variantRef.current = variant; }, [variant]);

  useEffect(() => {
    if (!mounted) return;

    // The native cursor is hidden only while this one is live (see globals.css),
    // so there is never a moment with no cursor or with two.
    document.documentElement.classList.add('has-custom-cursor');

    // RAF loop: only lerps ring position — no React involvement at all.
    // Stops while the tab is hidden.
    const tick = () => {
      const lag = variantRef.current === 'default' ? 0.095 : 0.075;
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * lag;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * lag;
      if (ringWrapRef.current) {
        const scale = clickingRef.current ? 0.86 : 1;
        ringWrapRef.current.style.transform =
          `translate3d(${ringPos.current.x}px,${ringPos.current.y}px,0) translate(-50%,-50%) scale(${scale})`;
      }
      rafRef.current = document.hidden ? 0 : requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      if (!document.hidden && !rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVisibility);
    rafRef.current = requestAnimationFrame(tick);

    // ── Hot path: position only, zero React state updates ─────────────────
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotWrapRef.current) {
        dotWrapRef.current.style.transform =
          `translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;
      }
    };

    // ── Variant detection: fires only when cursor crosses element boundaries
    //    (far less than once-per-pixel). No elementFromPoint needed — we get
    //    the element from the event itself.
    const onOver = (e: MouseEvent) => {
      const el = e.target as Element;

      const themeEl = el.closest('[data-theme]');
      const dark = themeEl?.getAttribute('data-theme') === 'dark';
      if (dark !== isDarkRef.current) {
        isDarkRef.current = dark;
        setIsDark(dark);
      }

      const cursorEl = el.closest('[data-cursor]');
      if (cursorEl) {
        const v = cursorEl.getAttribute('data-cursor') as CursorVariant;
        if (v !== variantRef.current) setVariant(v);
        return;
      }

      let next: CursorVariant = 'default';
      if (el.closest('button, a'))          next = 'link';
      else if (el.closest('input, textarea')) next = 'text';
      if (next !== variantRef.current) setVariant(next);
    };

    // ── Click: infrequent — state is fine here ──────────────────────────
    const onDown = () => { clickingRef.current = true;  setClicking(true);  };
    const onUp   = () => { clickingRef.current = false; setClicking(false); };

    // ── Visibility: direct DOM — no React re-render on enter/leave ────────
    const show = () => {
      if (dotWrapRef.current)  dotWrapRef.current.style.opacity  = '1';
      if (ringWrapRef.current) ringWrapRef.current.style.opacity = '1';
    };
    const hide = () => {
      if (dotWrapRef.current)  dotWrapRef.current.style.opacity  = '0';
      if (ringWrapRef.current) ringWrapRef.current.style.opacity = '0';
    };

    document.addEventListener('mousemove',  onMove,  { passive: true });
    document.addEventListener('mouseover',  onOver,  { passive: true });
    document.addEventListener('mousedown',  onDown);
    document.addEventListener('mouseup',    onUp);
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      document.documentElement.classList.remove('has-custom-cursor');
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mousedown',  onDown);
      document.removeEventListener('mouseup',    onUp);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
    };
  }, [mounted]);

  if (!mounted) return null;

  const cfg = CONFIGS[variant];
  const fg  = isDark ? '#FFFFFF' : '#0A0A0A';
  const bg  = isDark ? '#FFFFFF' : '#0A0A0A';
  const lbl = isDark ? '#0A0A0A' : '#FFFFFF';
  const cm  = clicking ? 0.86 : 1;

  return (
    <>
      {/* Dot — sticks to cursor via direct DOM transform */}
      <div
        ref={dotWrapRef}
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 9999,
          pointerEvents: 'none', willChange: 'transform',
          opacity: 0,
        }}
      >
        <motion.div
          animate={{
            width:           cfg.dotSize * cm,
            height:          cfg.dotSize * cm,
            backgroundColor: fg,
            opacity:         cfg.dotSize > 0 ? 1 : 0,
          }}
          transition={SPRING_FAST}
          style={{ borderRadius: '50%' }}
        />
      </div>

      {/* Ring — lagged follower via RAF loop */}
      <div
        ref={ringWrapRef}
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 9998,
          pointerEvents: 'none', willChange: 'transform',
          opacity: 0,
        }}
      >
        <motion.div
          animate={{
            width:           cfg.ringSize * cm,
            height:          cfg.ringSize * cm,
            borderWidth:     cfg.ringFilled ? 0 : cfg.borderWidth,
            borderColor:     fg,
            backgroundColor: cfg.ringFilled ? bg : 'transparent',
            opacity:         cfg.ringSize > 0 ? 1 : 0,
          }}
          transition={SPRING_RING}
          style={{
            borderRadius: '50%',
            borderStyle: 'solid',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence mode="wait">
            {cfg.label && (
              <motion.span
                key={cfg.label}
                initial={{ opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.65 }}
                transition={{ duration: 0.16, ease: EASE }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
              >
                {cfg.label === 'DRAG' ? (
                  <DragArrows color={lbl} />
                ) : (
                  <span
                    style={{
                      color:         lbl,
                      fontSize:      cfg.label.length > 4 ? 8 : 9.5,
                      letterSpacing: '0.14em',
                      fontWeight:    800,
                      fontFamily:    'Satoshi, system-ui, sans-serif',
                      textTransform: 'uppercase',
                      whiteSpace:    'nowrap',
                      lineHeight:    1,
                    }}
                  >
                    {cfg.label}
                  </span>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
