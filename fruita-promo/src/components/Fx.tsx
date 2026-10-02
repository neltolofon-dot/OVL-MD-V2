import React, {useMemo} from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {noise2D} from '@remotion/noise';
import {HEIGHT, IMG, WEDGE_AR, WIDTH} from '../theme';
import {lerp, rng} from '../lib/anim';

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
};

/**
 * Lens bokeh — the warm string lights of the original key visual,
 * rebuilt as a parallax field. `camX/camY` shift each orb by its depth.
 */
export const Bokeh: React.FC<{
  f: number;
  seed: number;
  count: number;
  colors: string[];
  r: [number, number];
  alpha: [number, number];
  camX?: number;
  camY?: number;
  rise?: number;
  zoom?: number;
}> = ({f, seed, count, colors, r, alpha, camX = 0, camY = 0, rise = 0.4, zoom = 1}) => {
  const orbs = useMemo(() => {
    const rand = rng(seed);
    return new Array(count).fill(0).map((_, i) => ({
      x: lerp(-0.08, 1.08, rand()) * WIDTH,
      y: lerp(-0.08, 1.08, rand()) * HEIGHT,
      d: lerp(0.25, 1, rand()),
      c: colors[Math.floor(rand() * colors.length)],
      ph: rand() * Math.PI * 2,
      i,
    }));
  }, [seed, count, colors]);

  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      {orbs.map((o) => {
        const radius = lerp(r[0], r[1], o.d * o.d);
        const a = lerp(alpha[0], alpha[1], o.d) * (0.78 + 0.22 * Math.sin(f * 0.07 + o.ph));
        const span = HEIGHT + 400;
        const yy = ((((o.y - f * rise * o.d + camY * o.d) % span) + span) % span) - 200;
        const xx = o.x + camX * o.d + noise2D(`bk${seed}`, o.i, f * 0.006) * 60;
        return (
          <div
            key={o.i}
            style={{
              position: 'absolute',
              left: xx - radius,
              top: yy - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${rgba(o.c, a * 0.55)} 0%, ${rgba(o.c, a * 0.62)} 56%, ${rgba(o.c, a * 0.95)} 64%, ${rgba(o.c, 0)} 71%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Volumetric rays fanning from a point, slowly rotating. */
export const LightRays: React.FC<{
  x: number;
  y: number;
  radius: number;
  rot: number;
  color: string;
  intensity: number;
  seed?: number;
}> = ({x, y, radius, rot, color, intensity, seed = 7}) => {
  const gradient = useMemo(() => {
    const rand = rng(seed);
    const stops: string[] = [];
    let angle = 0;
    while (angle < 360) {
      const gap = lerp(6, 16, rand());
      const width = lerp(2, 7, rand());
      const a = lerp(0.35, 1, rand());
      stops.push(`__C0__ ${angle.toFixed(1)}deg`);
      stops.push(`__C${a.toFixed(2)}__ ${(angle + width / 2).toFixed(1)}deg`);
      stops.push(`__C0__ ${(angle + width).toFixed(1)}deg`);
      angle += width + gap;
    }
    return stops;
  }, [seed]);
  const bg = `conic-gradient(from ${rot}deg, ${gradient
    .map((s) => s.replace(/__C([\d.]+)__/, (_, a) => rgba(color, parseFloat(a) * intensity)))
    .join(', ')})`;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        background: bg,
        WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 28%, rgba(0,0,0,0) 68%)',
        maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 28%, rgba(0,0,0,0) 68%)',
        filter: 'blur(5px)',
        mixBlendMode: 'screen',
      }}
    />
  );
};

/** Animated film grain — keeps flat gradients from looking digital. */
export const Grain: React.FC<{f: number; opacity?: number}> = ({f, opacity = 0.07}) => (
  <AbsoluteFill style={{mixBlendMode: 'overlay', opacity, pointerEvents: 'none'}}>
    <svg width={WIDTH} height={HEIGHT}>
      <filter id="fruita-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={2} seed={Math.floor(f) % 97} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#fruita-grain)" />
    </svg>
  </AbsoluteFill>
);

export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.55, color = '#000000'}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, ${rgba(color, 0)} 55%, ${rgba(color, strength)} 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Expanding shock ring — the visual twin of a kick drum. */
export const Ring: React.FC<{f: number; at: number; x: number; y: number; color: string; maxR?: number; dur?: number; width?: number; alpha?: number}> = ({
  f,
  at,
  x,
  y,
  color,
  maxR = 1100,
  dur = 22,
  width = 34,
  alpha = 0.5,
}) => {
  const t = (f - at) / dur;
  if (t < 0 || t > 1) return null;
  const e = 1 - Math.pow(1 - t, 4);
  const r = lerp(60, maxR, e);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        border: `${lerp(width, 1.5, e).toFixed(2)}px solid ${rgba(color, alpha * (1 - t))}`,
      }}
    />
  );
};

/**
 * Graphic pineapple slice (vector, crisp at any size). Used where the round
 * shape carries a match cut: the zeros of "100%".
 */
export const PineSlice: React.FC<{size: number; rot: number; style?: React.CSSProperties}> = ({size, rot, style}) => {
  const rays = 22;
  const eyes = 18;
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={style}>
      <defs>
        <radialGradient id="ps-flesh" cx="0" cy="0" r="88" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6CF" />
          <stop offset="0.45" stopColor="#FBE27A" />
          <stop offset="1" stopColor="#F2BA2F" />
        </radialGradient>
        <linearGradient id="ps-rind" x1="0" y1="-100" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E9A526" />
          <stop offset="1" stopColor="#B87314" />
        </linearGradient>
      </defs>
      <circle r="99" fill="url(#ps-rind)" />
      <circle r="86" fill="url(#ps-flesh)" />
      <g transform={`rotate(${rot})`}>
        {new Array(rays).fill(0).map((_, i) => {
          const a = (i / rays) * Math.PI * 2;
          const r1 = 22;
          const r2 = i % 2 ? 70 : 80;
          return (
            <line
              key={i}
              x1={Math.cos(a) * r1}
              y1={Math.sin(a) * r1}
              x2={Math.cos(a) * r2}
              y2={Math.sin(a) * r2}
              stroke="#FFF9E0"
              strokeOpacity={0.55}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          );
        })}
        {new Array(eyes).fill(0).map((_, i) => {
          const a = (i / eyes) * Math.PI * 2;
          return <ellipse key={i} cx={Math.cos(a) * 92.5} cy={Math.sin(a) * 92.5} rx={3.2} ry={2.2} fill="#7A4A0E" fillOpacity={0.55} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 92.5} ${Math.sin(a) * 92.5})`} />;
        })}
      </g>
      <circle r="18" fill="#FFF3C4" stroke="#F4D66C" strokeWidth={2} />
      <path d="M -62 -48 A 78 78 0 0 1 30 -72" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={5} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/** Photographic pineapple wedge (cut out of the key visual). */
export const Wedge: React.FC<{x: number; y: number; w: number; rot: number; blur?: number; opacity?: number; flip?: boolean}> = ({
  x,
  y,
  w,
  rot,
  blur = 0,
  opacity = 1,
  flip = false,
}) => {
  const h = w / WEDGE_AR;
  return (
    <Img
      src={IMG.wedge}
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`,
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        opacity,
      }}
    />
  );
};

/** A single water droplet — a clear lens with a bright rim and spec. */
export const Drop: React.FC<{x: number; y: number; size: number; angle: number; stretch: number; opacity: number}> = ({x, y, size, angle, stretch, opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: x - (size * stretch) / 2,
      top: y - size / 2,
      width: size * stretch,
      height: size,
      borderRadius: '50%',
      transform: `rotate(${angle}deg)`,
      opacity,
      background:
        'radial-gradient(ellipse at 38% 32%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 9%, rgba(255,255,255,0.18) 24%, rgba(255,250,220,0.08) 52%, rgba(255,250,220,0.55) 64%, rgba(255,250,220,0) 72%)',
    }}
  />
);
