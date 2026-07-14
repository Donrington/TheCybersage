import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const alt =
  'Abakwe Carrington — Software Engineer & Systems Architect in Lagos, Nigeria';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const STACK = ['AWS', 'Docker', 'Go', 'Django', 'PostgreSQL', 'Redis'];

export default function Image() {
  const logoBuffer = readFileSync(join(process.cwd(), 'public/logo/logo_white.png'));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;

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

        {/* Logo */}
        <div style={{ display: 'flex', marginBottom: 'auto' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Cybersage"
            width={104}
            height={66}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Name + role block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <span
            style={{
              color: 'rgba(255,255,255,0.38)',
              fontSize: '15px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Software Engineer &amp; Systems Architect — Lagos, Nigeria
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
            Software engineer &amp; systems architect in Lagos, Nigeria — 5+ years
            architecting distributed, production-grade systems. Available for hire worldwide.
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
