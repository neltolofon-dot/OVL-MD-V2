import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Can} from '../components/Can';
import {Drop, Ring, rgba} from '../components/Fx';
import {DirBlurDef, MotionBlur} from '../components/MotionBlur';
import {axes, C, CAN_AR} from '../theme';
import {clamp, ease, jitter, lerp, progress, rng, track, wobble} from '../lib/anim';

/**
 * 0 – 3 s · HOOK — "SHAKE WELL", the instruction printed on the can, taken
 * literally: the type trembles, the can is shaken hard enough to fling its
 * condensation, freezes on the downbeat, then the camera dives into the
 * label (the "opening" of the film).
 */

const CX = 960;
const CAN_Y = 545;
const CAN_H = 720;
const CAN_WPX = CAN_H * CAN_AR;

// Shake envelope (0 → 1) and the can's pose as pure functions of time, so the
// motion-blur sampler can evaluate them between frames.
const shakeEnv = (f: number) => track(f, [34, 39, 57, 60], [0, 1, 1.22, 0], [ease.outCubic, ease.linear, ease.inQuint]);
const phase = (f: number) => (2 * Math.PI * (f - 34)) / 7.5;
const canPose = (f: number) => {
  const e = shakeEnv(f);
  const y = track(f, [25, 37], [1450, CAN_Y], ease.outBack);
  return {
    x: CX + e * 40 * Math.sin(phase(f) + 0.5),
    y: y + e * 12 * Math.sin(2 * phase(f)),
    rot: track(f, [25, 37], [-16, 0], ease.outQuint) + e * 12 * Math.sin(phase(f)) + wobble(f, 60, 4.5, 10, 6),
  };
};

// Zoom-through: the camera dives into a plain stretch of the label.
// (0.30, 0.40) is a plain stretch of label between "PURE JUICE" and the claims.
export const DIVE_UV = {u: 0.3, v: 0.4};
export const DIVE_END_ZOOM = 22;
const FOCUS = {x: CX + (DIVE_UV.u - 0.5) * CAN_WPX, y: CAN_Y + (DIVE_UV.v - 0.5) * CAN_H};
const camZoom = (f: number) => track(f, [70, 90], [1, DIVE_END_ZOOM], ease.inExpo);
const camPull = (f: number) => track(f, [70, 90], [0, 1], ease.inOutCubic);

type Particle = {birth: number; side: number; vx: number; vy: number; size: number; life: number; ox: number; oy: number};

const useSpray = () =>
  useMemo<Particle[]>(() => {
    const rand = rng(42);
    return new Array(64).fill(0).map(() => {
      const side = rand() < 0.5 ? -1 : 1;
      return {
        birth: lerp(38, 61, rand()),
        side,
        vx: side * lerp(10, 34, rand()),
        vy: lerp(-24, 2, rand()),
        size: lerp(5, 17, rand()),
        life: lerp(12, 24, rand()),
        ox: lerp(0.25, 0.48, rand()),
        oy: lerp(-0.48, 0.2, rand()),
      };
    });
  }, []);

const Letters: React.FC<{
  text: string;
  f: number;
  start: number;
  size: number;
  outline?: boolean;
  shake: number;
  seed: string;
  from: 'top' | 'bottom';
}> = ({text, f, start, size, outline, shake, seed, from}) => (
  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: size * 0.86, lineHeight: 1}}>
    {text.split('').map((ch, i) => {
      const s = start + i * 1.6;
      const p = progress(f, s, s + 10);
      const pe = ease.outExpo(p);
      const scale = lerp(2.5, 1, pe) * lerp(1.06, 1, ease.outBack(p));
      const y = (from === 'top' ? -1 : 1) * lerp(150, 0, ease.outBack(p));
      const op = clamp((f - s) / 2.5);
      const dx = jitter(`${seed}x${i}`, f, 0.55, 15 * shake);
      const dy = jitter(`${seed}y${i}`, f, 0.55, 11 * shake);
      const dr = jitter(`${seed}r${i}`, f, 0.45, 6 * shake);
      const wdth = 125 - 32 * shake * (0.5 + 0.5 * Math.sin((2 * Math.PI * f) / 7.5 + i * 1.1));
      return (
        <span
          key={i}
          style={{
            ...axes(wdth, 900),
            display: 'inline-block',
            fontSize: size,
            letterSpacing: -size * 0.01,
            color: outline ? 'transparent' : C.sun,
            WebkitTextStroke: outline ? `${size * 0.016}px ${C.sun}` : undefined,
            transform: `translate(${dx}px, ${y + dy}px) rotate(${dr}deg) scale(${scale})`,
            opacity: op,
            filter: p < 1 ? `blur(${((1 - pe) * 14).toFixed(2)}px)` : undefined,
            textShadow: outline ? undefined : `0 0 60px ${rgba(C.gold, 0.25)}`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

export const HOOK_CAN_H = CAN_H;

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const spray = useSpray();

  const typeShake = track(f, [0, 8, 30, 38, 56, 60], [0.3, 0.12, 0.12, 1, 1, 0]);
  // Type pushed back when the can arrives, then flung off on the stop.
  const typeScale = track(f, [25, 38], [1, 1.1], ease.outExpo) * track(f, [0, 30], [1.04, 1], ease.outCubic);
  const exitShake = (ff: number) => track(ff, [60, 71], [0, 2300], ease.inExpo);
  const exitWell = (ff: number) => track(ff, [62, 73], [0, 2300], ease.inExpo);
  const vShake = exitShake(f + 0.5) - exitShake(f - 0.5);
  const vWell = exitWell(f + 0.5) - exitWell(f - 0.5);
  const typeDim = track(f, [26, 38], [1, 0.82]);

  const shine = track(f, [62, 76], [-0.1, 1.1], ease.inOutCubic);

  const zoomSamples = f >= 76 ? 9 : 1;
  const canSamples = f >= 25 && f <= 63 ? 14 : 1;

  const world = (ff: number) => {
    const z = camZoom(ff);
    const pull = camPull(ff);
    return {
      transform: `translate(${lerp(0, CX - FOCUS.x, pull)}px, ${lerp(0, 540 - FOCUS.y, pull)}px) scale(${z})`,
      transformOrigin: `${FOCUS.x}px ${FOCUS.y}px`,
    };
  };

  return (
    <AbsoluteFill style={{background: C.deeper, overflow: 'hidden'}}>
      <DirBlurDef id="hook-shake" x={Math.min(60, Math.abs(vShake) * 0.22)} />
      <DirBlurDef id="hook-well" x={Math.min(60, Math.abs(vWell) * 0.22)} />

      <MotionBlur frame={f} samples={zoomSamples} shutter={0.9}>
        {(zf) => (
          <AbsoluteFill style={world(zf)}>
            <AbsoluteFill
              style={{
                background: `radial-gradient(ellipse 62% 74% at 50% 50%, #17552B 0%, ${C.deep} 52%, ${C.deeper} 100%)`,
              }}
            />
            {[0, 15, 37, 60].map((at, i) => (
              <Ring key={at} f={f} at={at} x={CX} y={540} color={i === 2 ? C.lime : C.sun} alpha={i === 3 ? 0.55 : 0.32} />
            ))}

            {/* Kinetic type, behind the can */}
            <AbsoluteFill
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                transform: `scale(${typeScale})`,
                opacity: typeDim,
              }}
            >
              <div style={{transform: `translateX(${-exitShake(f)}px)`, filter: Math.abs(vShake) > 1 ? 'url(#hook-shake)' : undefined}}>
                <Letters text="SHAKE" f={f} start={-3} size={330} shake={typeShake} seed="s" from="top" />
              </div>
              <div style={{transform: `translateX(${exitWell(f)}px)`, marginTop: 6, filter: Math.abs(vWell) > 1 ? 'url(#hook-well)' : undefined}}>
                <Letters text="WELL" f={f} start={12} size={330} outline shake={typeShake} seed="w" from="bottom" />
              </div>
            </AbsoluteFill>

            {/* Flung condensation */}
            {spray.map((p, i) => {
              const age = f - p.birth;
              if (age < 0 || age > p.life) return null;
              const pose = canPose(p.birth);
              const a = (pose.rot * Math.PI) / 180;
              const lx = p.side * p.ox * CAN_WPX;
              const ly = p.oy * CAN_H;
              const ox = pose.x + lx * Math.cos(a) - ly * Math.sin(a);
              const oy = pose.y + lx * Math.sin(a) + ly * Math.cos(a);
              const vy = p.vy + 1.5 * age;
              const x = ox + p.vx * age;
              const y = oy + p.vy * age + 0.75 * age * age;
              const speed = Math.hypot(p.vx, vy);
              return (
                <Drop
                  key={i}
                  x={x}
                  y={y}
                  size={p.size}
                  angle={(Math.atan2(vy, p.vx) * 180) / Math.PI}
                  stretch={1 + speed * 0.06}
                  opacity={clamp(1 - age / p.life) * 0.9}
                />
              );
            })}

            {/* The can, with real motion blur while it is being shaken */}
            {f >= 24 ? (
              <MotionBlur frame={f} samples={zoomSamples > 1 ? 1 : canSamples} shutter={0.7}>
                {(cf) => {
                  const pose = canPose(cf);
                  return <Can x={pose.x} y={pose.y} h={CAN_H} rot={pose.rot} shine={shine} glow={camZoom(cf) < 1.5 ? 0.35 : 0} />;
                }}
              </MotionBlur>
            ) : null}
          </AbsoluteFill>
        )}
      </MotionBlur>

      {/* Light bloom building into the cut */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${rgba(C.cream, 1)} 0%, ${rgba(C.sun, 0.6)} 40%, ${rgba(C.sun, 0)} 75%)`,
          opacity: track(f, [80, 90], [0, 0.85], ease.inQuint),
        }}
      />
    </AbsoluteFill>
  );
};
