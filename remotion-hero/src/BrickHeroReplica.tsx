import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadJetBrains} from '@remotion/google-fonts/JetBrainsMono';

loadInter('normal', {
  subsets: ['latin'],
  weights: ['400', '700', '900'],
});

loadJetBrains('normal', {
  subsets: ['latin'],
  weights: ['400', '700'],
});

const BRICK_RED = '#DC2626';
const BG = '#050505';

const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@!';

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const typewriter = (text: string, frame: number, start: number, speed = 2) => {
  const chars = Math.max(0, Math.floor((frame - start) / speed));
  return text.slice(0, chars);
};

const scrambleText = (text: string, frame: number, seedOffset = 0) => {
  const wave = Math.floor(frame / 4);
  return text
    .split('')
    .map((c, i) => {
      if (c === ' ') return ' ';
      const lockProgress = i * 2 + 25;
      if (frame > lockProgress) return c;
      const r = seededRandom(i * 999 + wave + seedOffset);
      return glitchChars[Math.floor(r * glitchChars.length)];
    })
    .join('');
};

export const BrickHeroReplica: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const intro = spring({
    fps,
    frame,
    config: {damping: 200, stiffness: 140, mass: 1.2},
  });

  const monolithScale = interpolate(intro, [0, 1], [0.92, 1.0]);

  const breathe = 1 + Math.sin(frame / 22) * 0.02;
  const coreGlow = 0.65 + Math.sin(frame / 8) * 0.2;
  const textFade = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const ambientPulse = 1 + Math.sin(frame / 18) * 0.035;

  const grainX = Math.sin(frame / 13) * 18;
  const grainY = Math.cos(frame / 17) * 18;


  const topLineText = 'UM NOVO CORPO';
  const topLineStart = 35;
  const topLineSpeed = 2;
  const topLineDoneFrame = topLineStart + topLineText.length * topLineSpeed + 18;

  const scrambleLine = useMemo(
    () => typewriter(topLineText, frame, topLineStart, topLineSpeed),
    [frame]
  );

  const subtitleFrame = Math.max(0, frame - topLineDoneFrame);
  const subtitle = useMemo(
    () => scrambleText('A MESMA ALMA', subtitleFrame, 42),
    [subtitleFrame]
  );

  const subtitleOpacity = interpolate(frame, [topLineDoneFrame, topLineDoneFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const subtitleY = interpolate(frame, [topLineDoneFrame, topLineDoneFrame + 18], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        color: '#E5E5E5',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(220,38,38,0.10) 0%, rgba(220,38,38,0.02) 35%, transparent 70%)',
        }}
      />

      <AbsoluteFill
        style={{
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          opacity: 0.03,
          transform: `translate(${grainX}px, ${grainY}px)`,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${intro}) translateY(${interpolate(frame, [0, 40], [20, 0], {
            extrapolateRight: 'clamp',
          })}px)`,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 150,
            height: 300,
            borderRadius: 2,
            border: '1px solid #1a1a1a',
            background: 'linear-gradient(to bottom, #050505, #000000)',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 20px 60px rgba(0,0,0,0.75)',
            transform: `scale(${monolithScale * breathe})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 2,
              background:
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(130deg, rgba(255,255,255,0.03), transparent 30%, rgba(255,255,255,0.02) 70%, transparent)',
              mixBlendMode: 'overlay',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 360,
              height: 360,
              borderRadius: '50%',
              filter: 'blur(60px)',
              background:
                'radial-gradient(circle at center, rgba(153,27,27,0.12) 0%, rgba(153,27,27,0.03) 55%, transparent 75%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 420,
              height: 420,
              marginTop: -210,
              marginLeft: -210,
              borderRadius: '50%',
              filter: 'blur(70px)',
              opacity: 0.2 + coreGlow * 0.14,
              transform: `scale(${ambientPulse})`,
              background:
                'radial-gradient(circle, rgba(220,38,38,0.18) 0%, rgba(220,38,38,0.04) 55%, transparent 82%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 64,
              height: 64,
              marginTop: -32,
              marginLeft: -32,
              borderRadius: '50%',
              filter: 'blur(18px)',
              opacity: 0.22 + coreGlow * 0.2,
              transform: `scale(${ambientPulse * 0.9})`,
              background:
                'radial-gradient(circle, rgba(220,38,38,0.42) 0%, rgba(220,38,38,0.18) 35%, rgba(220,38,38,0.02) 75%, transparent 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 18,
              height: 18,
              marginTop: -9,
              marginLeft: -9,
              borderRadius: '50%',
              filter: 'blur(2px)',
              opacity: 0.5 + coreGlow * 0.2,
              transform: `scale(${ambientPulse * 0.95})`,
              backgroundColor: 'rgba(220,38,38,0.72)',
              boxShadow: '0 0 14px rgba(220,38,38,0.45)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          />
        </div>

        <div
          style={{
            marginTop: 58,
            textAlign: 'center',
            opacity: textFade,
            transform: `translateY(${interpolate(frame, [20, 70], [12, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 150,
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: 16,
              fontSize: 42,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#fff',
              textShadow: '0 0 25px rgba(0,0,0,0.7)',
              letterSpacing: -0.8,
            }}
          >
            {scrambleLine}
            <span
              style={{
                color: BRICK_RED,
                opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0.25,
              }}
            >
              _
            </span>
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: 84,
              lineHeight: 1,
              color: BRICK_RED,
              fontWeight: 900,
              letterSpacing: -2.2,
              textShadow: '0 0 18px rgba(220,38,38,0.45)',
              textTransform: 'uppercase',
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              minHeight: 84,
            }}
          >
            {subtitleOpacity > 0 ? subtitle : '\u00A0'}
          </h1>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
