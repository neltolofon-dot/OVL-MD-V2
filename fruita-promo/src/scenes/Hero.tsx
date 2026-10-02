import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Can} from '../components/Can';
import {Bokeh, LightRays, Ring, Vignette, Wedge, rgba} from '../components/Fx';
import {axes, C, CAN_AR} from '../theme';
import {clamp, ease, jitter, lerp, progress, track} from '../lib/anim';

/**
 * 11 – 15 s · HERO / END FRAME — the montage hands over the can at full
 * size; the drop blows light and fruit outward, the camera eases back to
 * the key-visual framing, and the line printed on the can closes the loop
 * opened by the hook: SHAKE WELL … BEFORE OPENING!
 */

const pose = (f: number) => {
  const t = ease.inOutCubic(progress(f, 2, 48));
  const push = track(f, [48, 120], [1, 1.035], ease.inOutSine);
  return {
    x: 960,
    y: lerp(540, 466, t) + jitter('hy', f, 0.03, 4) * t,
    h: lerp(870, 760, t) * push,
  };
};

type Fruit = {x: number; y: number; w: number; rot: number; spin: number; blur: number; d: number; flip?: boolean; delay: number};
const FRUIT: Fruit[] = [
  {x: 420, y: 300, w: 210, rot: -32, spin: 0.12, blur: 3, d: 0.6, delay: 0},
  {x: 1540, y: 640, w: 170, rot: 26, spin: -0.1, blur: 2.6, d: 0.65, delay: 2, flip: true},
  {x: 300, y: 850, w: 400, rot: -8, spin: 0.08, blur: 9, d: 1.5, delay: 1},
  {x: 1660, y: 180, w: 320, rot: 18, spin: -0.14, blur: 8, d: 1.4, delay: 3, flip: true},
];

const Sparkle: React.FC<{x: number; y: number; size: number; o: number; rot: number}> = ({x, y, size, o, rot}) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x - size,
        top: y - size,
        width: size * 2,
        height: size * 2,
        opacity: o,
        transform: `rotate(${rot}deg)`,
        mixBlendMode: 'screen',
        background: [
          'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,250,220,0.6) 10%, rgba(255,250,220,0) 26%)',
          'linear-gradient(90deg, rgba(255,250,225,0) 0%, rgba(255,250,225,0.95) 50%, rgba(255,250,225,0) 100%) center / 100% 5% no-repeat',
          'linear-gradient(0deg, rgba(255,250,225,0) 0%, rgba(255,250,225,0.95) 50%, rgba(255,250,225,0) 100%) center / 5% 100% no-repeat',
        ].join(', '),
      }}
    />
  );

const GLINTS = [
  {u: 0.27, v: 0.14, at: 52},
  {u: 0.74, v: 0.36, at: 64},
  {u: 0.18, v: 0.62, at: 76},
  {u: 0.58, v: 0.86, at: 97},
  {u: 0.47, v: 0.46, at: 108},
];

const TAGLINE = [
  {t: 'SHAKE', at: 60},
  {t: 'WELL', at: 67},
  {t: 'BEFORE', at: 75},
  {t: 'OPENING!', at: 90, accent: true},
];

export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const can = pose(f);
  const w = can.h * CAN_AR;
  const camX = track(f, [0, 120], [40, -40], ease.inOutSine);
  const burst = track(f, [0, 5, 40], [0, 1, 0.42], [ease.outExpo, ease.inOutSine]);
  const draw = ease.inOutCubic(progress(f, 8, 52));

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.deeper}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 62% 72% at 50% 44%, #1D5A2C 0%, ${C.deep} 48%, ${C.deeper} 100%)`}} />
      <AbsoluteFill style={{filter: 'blur(1.5px)'}}>
        <Bokeh f={f + 600} seed={5} count={32} colors={[C.gold, C.sun, C.amber, C.cream]} r={[12, 105]} alpha={[0.07, 0.38]} rise={0.35} camX={camX} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 43%, ${rgba(C.sun, 0.5 * burst + 0.12)} 0%, ${rgba(C.gold, 0.16 * burst + 0.06)} 26%, ${rgba(C.gold, 0)} 52%)`,
        }}
      />
      <LightRays x={960} y={430} radius={lerp(700, 1500, ease.outExpo(progress(f, 0, 24)))} rot={f * 0.08} color={C.sun} intensity={0.05 + 0.3 * burst} seed={3} />
      <Ring f={f} at={0} x={960} y={500} color={C.sun} alpha={0.45} maxR={1400} dur={26} width={34} />
      <Ring f={f} at={4} x={960} y={500} color={C.cream} alpha={0.25} maxR={1200} dur={28} width={20} />

      {/* Giant outline word behind the product, drawn stroke by stroke */}
      <svg width={1920} height={1080} style={{position: 'absolute', transform: `translateX(${camX * 0.35}px)`}}>
        <text
          x={960}
          y={576}
          textAnchor="middle"
          textLength={1740}
          lengthAdjust="spacing"
          style={{...axes(100, 900), fontSize: 300}}
          fill={rgba(C.sun, 0.07 * progress(f, 40, 70))}
          stroke={rgba(C.sun, 0.5)}
          strokeWidth={2.2}
          strokeDasharray="1500"
          strokeDashoffset={lerp(1500, 0, draw)}
        >
          PINEAPPLE
        </text>
      </svg>

      {FRUIT.filter((fr) => fr.d < 1).map((fr, i) => (
        <FruitPiece key={i} fr={fr} f={f} camX={camX} />
      ))}

      <Can
        x={can.x}
        y={can.y}
        h={can.h}
        glow={0.3 + 0.3 * burst}
        shadow={0.85}
        reflection={0.32}
        shine={track(f, [92, 108], [-0.1, 1.1], ease.inOutCubic)}
      />
      {GLINTS.map((g, i) => {
        const t = f - g.at;
        const o = t < 0 ? 0 : Math.sin(clamp(t / 10) * Math.PI);
        return <Sparkle key={i} x={can.x + (g.u - 0.5) * w} y={can.y + (g.v - 0.5) * can.h} size={30} o={o} rot={t * 4} />;
      })}

      {FRUIT.filter((fr) => fr.d >= 1).map((fr, i) => (
        <FruitPiece key={i} fr={fr} f={f} camX={camX} />
      ))}

      <Vignette strength={0.5} />

      {/* Sign-off: the instruction printed on the can, completed */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 902, display: 'flex', justifyContent: 'center', gap: 24}}>
        {TAGLINE.map((wd) => {
          const p = progress(f, wd.at - 1, wd.at + 8);
          const pe = ease.outExpo(p);
          return (
            <span
              key={wd.t}
              style={{
                ...axes(125, 900),
                fontSize: 58,
                lineHeight: 1,
                color: wd.accent ? C.sun : C.cream,
                opacity: clamp(p * 3),
                display: 'inline-block',
                transform: `scale(${lerp(1.9, 1, pe) * (wd.accent ? lerp(1.12, 1, ease.outBack(progress(f, wd.at + 2, wd.at + 14))) : 1)})`,
                filter: p < 1 ? `blur(${((1 - pe) * 10).toFixed(2)}px)` : undefined,
                textShadow: wd.accent ? `0 0 40px ${rgba(C.gold, 0.45)}` : undefined,
              }}
            >
              {wd.t}
            </span>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 994,
          textAlign: 'center',
          ...axes(100, 650),
          fontSize: 21,
          letterSpacing: '0.34em',
          color: rgba(C.cream, 0.72),
          clipPath: `inset(0 ${(50 * (1 - ease.inOutExpo(progress(f, 40, 58)))).toFixed(2)}% 0 ${(50 * (1 - ease.inOutExpo(progress(f, 40, 58)))).toFixed(2)}%)`,
        }}
      >
        PURE JUICE&nbsp;&nbsp;•&nbsp;&nbsp;100% PINEAPPLE&nbsp;&nbsp;•&nbsp;&nbsp;NO ADDED CHEMICALS
      </div>
    </AbsoluteFill>
  );
};

const FruitPiece: React.FC<{fr: Fruit; f: number; camX: number}> = ({fr, f, camX}) => {
  // Blown outward from the can on the drop, then drifting in slow motion.
  const out = ease.outExpo(progress(f, fr.delay, fr.delay + 30));
  const x = lerp(960, fr.x, out) + camX * fr.d + jitter(`hf${fr.x}`, f, 0.02, 16);
  const y = lerp(500, fr.y, out) + jitter(`hfy${fr.x}`, f, 0.02, 12);
  return <Wedge x={x} y={y} w={fr.w * lerp(0.3, 1, out)} rot={fr.rot + f * fr.spin + (1 - out) * 120} blur={fr.blur} opacity={clamp(out * 3)} flip={fr.flip} />;
};
