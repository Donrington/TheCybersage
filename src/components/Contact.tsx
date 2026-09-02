'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import { ContactCanvas } from './ContactCanvas';
import { useReducedMotion } from '@/lib/useReducedMotion';

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = [0.22, 1, 0.36, 1] as const;

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/Donrington',
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/carrington-abakwe-b0b0a0217',
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/CarlSwitch_CHUG',
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

/* ── Magnetic CTA button ──────────────────────────────────────────────────── */
function MagneticCTA({
  label,
  onClick,
  variant = 'outline',
}: {
  label: string;
  onClick: () => void;
  variant?: 'outline' | 'solid';
}) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 26 });
  const y = useSpring(rawY, { stiffness: 280, damping: 26 });
  const reduced = useReducedMotion();

  const solid = variant === 'solid';

  return (
    <motion.button
      data-cursor="hire"
      style={{ x, y, position: 'relative' }}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set((e.clientX - r.left - r.width / 2) * 0.3);
        rawY.set((e.clientY - r.top - r.height / 2) * 0.3);
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onMouseEnter={(e) => e.currentTarget.style.setProperty('--mh', '1')}
      onMouseLeave={(e) => { rawX.set(0); rawY.set(0); e.currentTarget.style.setProperty('--mh', '0'); }}
      className={
        solid
          ? 'group inline-flex items-center gap-3 bg-white text-black px-8 py-4 hover:bg-white/85 transition-colors duration-300'
          : 'group inline-flex items-center gap-3 border border-white/20 px-8 py-4 text-white/60 hover:text-white hover:border-white/50 transition-colors duration-300'
      }
      whileHover={!solid ? { backgroundColor: 'rgba(255,255,255,0.04)' } : undefined}
    >
      {/* Liquid metal — light variant, since the solid button is a white
          fill. Only on solid: this is the primary conversion CTA, kept
          visually distinct from the plain outline "Send a Message" button
          beside it so the effect still reads as "primary," not applied to
          every button in the pair. */}
      {solid && !reduced && (
        <span aria-hidden className="metal-edge-light" style={{ position: 'absolute', inset: 0, padding: 1.5, pointerEvents: 'none', animationDuration: '7s' }} />
      )}
      {solid && (
        <span aria-hidden className="metal-highlight-light" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      )}
      <span
        className="text-[0.65rem] tracking-[0.22em] uppercase font-medium"
        style={{ fontFamily: 'Satoshi, system-ui, sans-serif', position: 'relative', zIndex: 1 }}
      >
        {label}
      </span>
      <ArrowUpRight size={13} style={{ position: 'relative', zIndex: 1 }} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
    </motion.button>
  );
}

/* ── Validation ───────────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = { name: string; email: string; message: string };
type FieldErrors = Record<keyof FormState, string>;

function getErrors(f: FormState): FieldErrors {
  return {
    name: f.name.trim().length < 2 ? 'Please enter your name.' : '',
    email: !EMAIL_RE.test(f.email.trim()) ? 'Enter a valid email address.' : '',
    message: f.message.trim().length < 10 ? 'A little more detail helps (10+ characters).' : '',
  };
}

/* ── Contact modal ────────────────────────────────────────────────────────── */
function ContactModal({ intent, onClose }: { intent: 'message' | 'call'; onClose: () => void }) {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    message: intent === 'call' ? 'I’d like to book a quick call to discuss a project. My availability / timezone is: ' : '',
  });
  const [touched, setTouched] = useState({ name: false, email: false, message: false });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const reduced = useReducedMotion();

  const errors = getErrors(form);
  const isValid = !errors.name && !errors.email && !errors.message;
  const canSubmit = status !== 'sending' && isValid;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ name: true, email: true, message: true });
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const fieldClass = (hasError: boolean) =>
    `w-full bg-transparent border ${hasError ? 'border-red-400/50 focus:border-red-400/70' : 'border-white/12 focus:border-white/40'} text-white placeholder:text-white/18 px-5 py-3.5 text-sm focus:outline-none transition-colors duration-200`;

  const errorClass =
    'text-[0.58rem] tracking-[0.04em] text-red-400/70 mt-1.5 block';

  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        data-theme="dark"
        className="relative w-full sm:max-w-xl bg-[#0d0d0d] border border-white/10 overflow-hidden"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-px h-12 bg-white/20" />
          <div className="absolute top-0 right-0 w-12 h-px bg-white/20" />
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-px h-12 bg-white/10" />
          <div className="absolute bottom-0 left-0 w-12 h-px bg-white/10" />
        </div>

        {/* Beam — traces the full panel edge; the corner accents above sit on
            top of it at just two corners, same layering as AIAssistant's own
            panel which pairs the two treatments successfully. */}
        {!reduced && (
          <span aria-hidden className="beam-ring" style={{ position: 'absolute', inset: 0, padding: 1, pointerEvents: 'none', animationDuration: '5s' }} />
        )}

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <span
                className="text-[0.55rem] tracking-[0.28em] uppercase text-white/25 font-medium block mb-2"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                {intent === 'call' ? 'Book a Call' : 'Get in Touch'}
              </span>
              <h2
                className="font-black text-white tracking-[-0.035em] leading-tight"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                }}
              >
                {intent === 'call' ? 'Let’s' : 'Start a'}{' '}
                <span
                  style={{
                    fontFamily: 'var(--font-instrument), Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.32)',
                  }}
                >
                  {intent === 'call' ? 'talk' : 'conversation'}
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 border border-white/12 flex items-center justify-center text-white/30 hover:text-white hover:border-white/35 transition-colors duration-200 shrink-0 mt-1"
            >
              <X size={14} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center"
              >
                <div className="w-12 h-px bg-white/20 mx-auto mb-8" />
                <p
                  className="text-white/55 leading-relaxed mb-2"
                  style={{
                    fontFamily: 'var(--font-instrument), Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                  }}
                >
                  Message received.
                </p>
                <p
                  className="text-white/30 text-sm"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  I&apos;ll be in touch within 24 hours.
                </p>
                <button
                  onClick={onClose}
                  className="mt-8 text-[0.6rem] tracking-[0.2em] uppercase text-white/25 hover:text-white/60 transition-colors"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-[0.58rem] tracking-[0.18em] uppercase text-white/28 mb-2 font-medium"
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                      className={fieldClass(touched.name && !!errors.name)}
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                      placeholder="Your name"
                      aria-invalid={touched.name && !!errors.name}
                    />
                    {touched.name && errors.name && (
                      <span className={errorClass} style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>{errors.name}</span>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-[0.58rem] tracking-[0.18em] uppercase text-white/28 mb-2 font-medium"
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                      className={fieldClass(touched.email && !!errors.email)}
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                      placeholder="your@email.com"
                      aria-invalid={touched.email && !!errors.email}
                    />
                    {touched.email && errors.email && (
                      <span className={errorClass} style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>{errors.email}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[0.58rem] tracking-[0.18em] uppercase text-white/28 mb-2 font-medium"
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                  >
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    onBlur={() => setTouched((p) => ({ ...p, message: true }))}
                    className={`${fieldClass(touched.message && !!errors.message)} resize-none`}
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    placeholder="Tell me about your project..."
                    aria-invalid={touched.message && !!errors.message}
                  />
                  {touched.message && errors.message && (
                    <span className={errorClass} style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>{errors.message}</span>
                  )}
                </div>

                {status === 'error' && (
                  <p
                    className="text-[0.6rem] tracking-[0.12em] text-red-400/70 font-medium"
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                  >
                    Something went wrong — please try again or email directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.setProperty('--mh', '1')}
                  onMouseLeave={(e) => e.currentTarget.style.setProperty('--mh', '0')}
                  className="relative w-full bg-white text-black py-4 text-[0.62rem] tracking-[0.22em] uppercase font-semibold hover:bg-white/88 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {!reduced && canSubmit && (
                    <span aria-hidden className="metal-edge-light" style={{ position: 'absolute', inset: 0, padding: 1.5, pointerEvents: 'none', animationDuration: '6s' }} />
                  )}
                  {canSubmit && (
                    <span aria-hidden className="metal-highlight-light" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {status === 'sending' ? 'Sending...' : intent === 'call' ? 'Request Call' : 'Send Message'}
                  </span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────────────────────── */
export function Contact() {
  const sectionRef   = useRef<HTMLElement>(null);
  const emailRef     = useRef<HTMLAnchorElement>(null);
  const footerRef    = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });
  const footerInView  = useInView(footerRef, { once: true, margin: '-10%' });
  const reduced = useReducedMotion();
  const [modal, setModal] = useState<null | 'message' | 'call'>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setModal(detail === 'call' ? 'call' : 'message');
    };
    window.addEventListener('open-contact-modal', handler);
    return () => window.removeEventListener('open-contact-modal', handler);
  }, []);

  /* ── Email SplitText animation ── */
  useEffect(() => {
    if (!sectionRef.current || !emailRef.current) return;
    const ctx = gsap.context(() => {
      const split = new SplitText(emailRef.current!, { type: 'chars' });
      gsap.fromTo(
        split.chars,
        { y: 48, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 1.1,
          stagger: 0.022,
          ease: 'power4.out',
          scrollTrigger: { trigger: emailRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="contact"
        data-theme="dark"
        className="w-full bg-[#0A0A0A] border-t border-white/6 relative overflow-hidden"
      >
        {/* Constellation background */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
          <ContactCanvas />
        </div>

        <div className="relative z-10 max-w-360 mx-auto px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(5rem,10vw,11rem)] pb-0">

          {/* Section label */}
          <div className="flex items-center gap-4 mb-[clamp(3rem,6vw,8rem)]">
            <motion.span
              className="text-[0.6rem] tracking-[0.22em] uppercase text-white/20 font-medium shrink-0"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              initial={{ opacity: 0, x: -16 }}
              animate={sectionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE }}
            >
              08 / Contact
            </motion.span>
            <motion.div
              className="flex-1 h-px bg-white/10"
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={sectionInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
            />
          </div>

          {/* Giant email CTA */}
          <div className="mb-[clamp(3rem,6vw,8rem)]">
            <motion.p
              className="text-white/30 mb-5"
              style={{
                fontFamily: 'var(--font-instrument), Georgia, serif',
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 2vw, 1.6rem)',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            >
              Have a project in mind?
            </motion.p>

            <div className="overflow-hidden mb-8">
              <a
                ref={emailRef}
                href="mailto:abakwecarrington@gmail.com"
                className="block font-black text-white tracking-[-0.04em] leading-[0.88] hover:text-white/45 transition-colors duration-300 will-change-transform"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.8rem, 5.5vw, 7rem)',
                  wordBreak: 'break-all',
                }}
              >
                abakwecarrington@gmail.com
              </a>
            </div>

            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            >
              <MagneticCTA label="Book a Call" variant="solid" onClick={() => setModal('call')} />
              <MagneticCTA label="Send a Message" onClick={() => setModal('message')} />
              <a
                href="mailto:abakwecarrington@gmail.com"
                className="text-[0.62rem] tracking-[0.18em] uppercase text-white/28 hover:text-white/60 transition-colors duration-200 font-medium"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                or email directly →
              </a>
            </motion.div>
          </div>

          {/* Info strip */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-white/8 mb-0"
            initial={{ opacity: 0 }}
            animate={sectionInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          >
            {[
              { label: 'Location', value: 'Lagos, Nigeria · Remote Worldwide' },
              { label: 'Response', value: 'Within 24 hours' },
              { label: 'Status', value: 'Available for projects', pulse: true },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`py-8 pr-8 ${i > 0 ? 'sm:border-l sm:border-white/8 sm:pl-8 sm:pr-0' : ''}`}
              >
                <p
                  className="text-[0.55rem] tracking-[0.22em] uppercase text-white/22 font-medium mb-2"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {item.label}
                </p>
                <div className="flex items-center gap-2">
                  {item.pulse && <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse shrink-0" />}
                  <p
                    className="text-white/55 font-medium"
                    style={{
                      fontFamily: 'Satoshi, system-ui, sans-serif',
                      fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────────
            Deliberately restrained: no photo, no continuous jitter/glitch —
            one calm scroll-triggered reveal on the giant wordmark, then it
            rests. Asymmetric top split (logo left / nav+socials right)
            instead of the previous centered-everything layout. */}
        <footer ref={footerRef} className="relative z-10 overflow-hidden">

          {/* Soft material fade instead of a hard 1px divider line */}
          <div
            aria-hidden
            className="h-24 -mb-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)' }}
          />

          <div className="relative z-10 max-w-360 mx-auto px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(4rem,7vw,6rem)] pb-[clamp(2.5rem,5vw,3.5rem)]">

            {/* Top split — big logo + tagline (left) / nav + socials (right) */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16 mb-[clamp(3rem,6vw,5rem)]">

              <motion.div
                className="flex flex-col gap-5 max-w-xs"
                initial={{ opacity: 0, y: 14 }}
                animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              >
                <Image
                  src="/sage/sage_horiz1_white_trimmed.png"
                  alt="Cybersage"
                  width={939}
                  height={411}
                  className="opacity-95"
                  style={{ height: 'clamp(3.25rem, 6vw, 5.25rem)', width: 'auto' }}
                />
                <p
                  style={{
                    fontFamily: 'var(--font-instrument), Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
                    color: 'rgba(255,255,255,0.32)',
                    lineHeight: 1.5,
                  }}
                >
                  Infrastructure &amp; systems architecture for teams that ship.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row-reverse lg:flex-col items-start lg:items-end gap-8 lg:gap-7"
                initial={{ opacity: 0, y: 14 }}
                animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
              >
                <div className="flex items-center gap-3">
                  {SOCIALS.map(({ label, href, svg }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 border border-white/12 flex items-center justify-center text-white/25 hover:text-white hover:border-white/35 transition-all duration-200"
                    >
                      {svg}
                    </a>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-left lg:text-right">
                  {[
                    { label: 'About', href: '#about' },
                    { label: 'Projects', href: '#work' },
                    { label: 'Services', href: '#services' },
                    { label: 'Process', href: '#process' },
                    { label: 'Systems', href: '#systems' },
                    { label: 'Credentials', href: '#credentials' },
                    { label: 'Reviews', href: '#testimonials' },
                    { label: 'Contact', href: '#contact' },
                  ].map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="text-[0.58rem] tracking-[0.2em] uppercase text-white/22 hover:text-white/60 transition-colors duration-200 font-medium"
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Launch record badge */}
            <motion.div
              className="mb-[clamp(3rem,6vw,5rem)]"
              initial={{ opacity: 0 }}
              animate={sectionInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.75, ease: EASE }}
            >
              <a
                href="https://websitelaunches.com/site/cybersage.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 border border-white/10 px-4 py-3 hover:border-white/22 transition-all duration-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/22 group-hover:bg-white/50 shrink-0 transition-colors duration-300" />
                <div className="flex flex-col gap-[3px]">
                  <span
                    style={{
                      fontFamily: 'Satoshi, system-ui, sans-serif',
                      fontSize: '0.52rem',
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.35)',
                      fontWeight: 600,
                    }}
                    className="group-hover:text-white/58 transition-colors duration-300"
                  >
                    Established Online
                  </span>
                  <span
                    style={{
                      fontFamily: 'Satoshi, system-ui, sans-serif',
                      fontSize: '0.44rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.16)',
                      fontWeight: 500,
                    }}
                  >
                    Public launch record
                  </span>
                </div>
                <ArrowUpRight
                  size={9}
                  className="text-white/18 group-hover:text-white/45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0"
                />
              </a>
            </motion.div>
          </div>

          {/* Giant wordmark — left-aligned (not centered) so it reads as
              confidently overflowing the grid rather than politely fitted
              to it; footer's own overflow-hidden crops it on narrow
              viewports. One reveal on scroll-into-view, then it rests —
              no idle float, no glitch. */}
          <div className="pl-[clamp(1.25rem,5vw,5rem)] pb-[clamp(1.5rem,3vw,2.5rem)]">
            <motion.span
              aria-hidden
              style={{
                display: 'block',
                fontFamily: 'Satoshi, system-ui, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(4.5rem, 18vw, 21rem)',
                letterSpacing: '-0.035em',
                color: 'rgba(255,255,255,0.05)',
                lineHeight: 0.8,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 48 }}
              animate={footerInView ? (reduced ? { opacity: 1 } : { opacity: 1, y: 0 }) : {}}
              transition={{ duration: 1.2, ease: EASE }}
            >
              CYBERSAGE
            </motion.span>
          </div>

          {/* Bottom bar */}
          <div className="relative z-10 max-w-360 mx-auto px-[clamp(1.25rem,5vw,5rem)] pb-[clamp(2rem,4vw,3rem)]">
            <motion.div
              className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-t border-white/6 pt-8"
              initial={{ opacity: 0 }}
              animate={sectionInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
            >
              <p
                className="text-[0.55rem] tracking-[0.16em] uppercase text-white/18 font-medium text-center sm:text-left"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                © 2026 Abakwe Carrington · Cybersage · Software Engineer, Lagos, Nigeria
              </p>
              <p
                className="text-[0.55rem] tracking-[0.14em] uppercase text-white/12 text-center sm:text-right"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                Designed &amp; Developed by Carrington
              </p>
            </motion.div>
          </div>
        </footer>
      </section>

      {/* Modal portal */}
      <AnimatePresence>
        {modal && <ContactModal intent={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </>
  );
}
