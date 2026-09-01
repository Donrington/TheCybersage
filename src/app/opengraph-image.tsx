import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const alt =
  'Abakwe Carrington — Software Engineer & Systems Architect, Remote Worldwide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const STACK = ['AWS', 'Docker', 'Go', 'Django', 'PostgreSQL', 'Redis'];

export default function Image() {
  const logoBuffer = readFileSync(join(process.cwd(), 'public/sage/sage_horiz1_white_trimmed.png'));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  const bgBuffer = readFileSync(join(process.cwd(), 'public/og-background.jpg'));
  const bgSrc = `data:image/jpeg;base64,${bgBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          position: 'relative',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* Generated background texture (Higgsfield, cinematic_studio_2_5) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgSrc}
          alt=""
          width={1200}
          height={630}
          style={{ position: 'absolute', inset: 0, objectFit: 'cover' }}
        />

        {/* Dark scrim — the background's brightest glow sits upper-left,
            right where the logo and eyebrow/name text also sit. Same
            proven pattern as Hero.tsx's video scrim: dims that corner for
            contrast without flattening the texture everywhere else. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 75% at 12% 18%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 75%), linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.45) 100%)',
          }}
        />

        {/* Top white rule */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: '#FFFFFF',
          }}
        />

        {/* Logo — full mark + wordmark lockup, not just the bare hexagon */}
        <div style={{ display: 'flex', marginBottom: 'auto', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Cybersage"
            width={210}
            height={92}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Name + role block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
          <span
            style={{
              color: 'rgba(255,255,255,0.38)',
              fontSize: '15px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Software Engineer &amp; Systems Architect — Remote, Worldwide
          </span>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '82px',
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: '-0.03em',
              }}
            >
              Abakwe
            </span>
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '82px',
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: '-0.03em',
              }}
            >
              Carrington
            </span>
          </div>

          <p
            style={{
              color: 'rgba(255,255,255,0.48)',
              fontSize: '20px',
              lineHeight: 1.55,
              maxWidth: '560px',
              margin: '6px 0 0',
            }}
          >
            Software engineer &amp; systems architect — 5+ years architecting distributed,
            production-grade systems. Available for hire, remote worldwide.
          </p>
        </div>

        {/* Divider + footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '44px',
            paddingTop: '22px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
          }}
        >
          {/* Tech stack pills */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {STACK.map((tech) => (
              <span
                key={tech}
                style={{
                  color: 'rgba(255,255,255,0.52)',
                  fontSize: '13px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  padding: '5px 13px',
                  letterSpacing: '0.04em',
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          <span
            style={{
              color: 'rgba(255,255,255,0.22)',
              fontSize: '13px',
              letterSpacing: '0.08em',
            }}
          >
            cybersage.dev
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
