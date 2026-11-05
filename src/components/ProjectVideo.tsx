'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, X } from 'lucide-react';
import { lenisInstance } from '@/lib/SmoothScroll';

/**
 * "Watch video" button and its player. The player is a native <dialog> (focus trap and Escape come from the
 * browser), the video loads only when opened (preload="none") and pauses when closed. Smooth scroll is stopped
 * while it is open so the page behind does not drift.
 */
export function ProjectVideo({
  src,
  poster,
  title,
  compact = false,
}: {
  src: string;
  poster?: string;
  title: string;
  /** Larger tap target for phones. */
  compact?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  const open = () => {
    setMounted(true);
    requestAnimationFrame(() => {
      dialog.current?.showModal();
      lenisInstance?.stop();
      void video.current?.play().catch(() => {});
    });
  };
  const close = () => dialog.current?.close();

  useEffect(() => {
    const dlg = dialog.current;
    if (!dlg) return;
    const onClose = () => {
      video.current?.pause();
      lenisInstance?.start();
    };
    dlg.addEventListener('close', onClose);
    return () => {
      dlg.removeEventListener('close', onClose);
      lenisInstance?.start();
    };
  }, [mounted]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          minHeight: compact ? '44px' : undefined,
          padding: compact ? '0 1rem' : '0.5rem 0.9rem',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: compact ? '999px' : 0,
          background: 'transparent',
          color: compact ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)',
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontSize: '0.75rem', // 12px floor (was 0.5/0.55rem)
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = 'rgba(255,255,255,0.07)';
          el.style.color = 'rgba(255,255,255,0.9)';
          el.style.borderColor = 'rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = 'transparent';
          el.style.color = compact ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)';
          el.style.borderColor = 'rgba(255,255,255,0.14)';
        }}
      >
        <Play size={compact ? 11 : 9} fill="currentColor" aria-hidden />
        Watch Video
      </button>

      {mounted && (
        <dialog
          ref={dialog}
          aria-label={`${title}: video`}
          onClick={(e) => e.target === dialog.current && close()}
          style={{
            width: 'min(1100px, 94vw)',
            maxHeight: '92vh',
            margin: 'auto',
            padding: 0,
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '14px',
            background: '#0a0a0a',
            color: '#fff',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative' }}>
            <video
              ref={video}
              src={src}
              poster={poster}
              controls
              playsInline
              preload="none"
              style={{ display: 'block', width: '100%', maxHeight: '86vh', background: '#000' }}
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close video"
              style={{
                position: 'absolute',
                top: '0.7rem',
                right: '0.7rem',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(10,10,10,0.7)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
