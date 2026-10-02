import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Can} from '../components/Can';
import {MotionBlur} from '../components/MotionBlur';
import {DIVE_END_ZOOM, DIVE_UV, HOOK_CAN_H} from './Hook';
import {Bokeh, LightRays, Ring, Wedge, rgba} from '../components/Fx';
import {axes, C, CAN_AR} from '../theme';
import {Cam, layer} from '../lib/camera';
import {ease, jitter, lerp, track} from '../lib/anim';

/**
 * 3 – 7 s · REVEAL — the camera pulls out of the label it dove into and
 * lands on the can in a sunlit studio built from the pack's own gradient
 * (amber sky, cream floor). Then a continuous macro move tours the
 * packaging: logo → script → illustration.
 */

const CAN = {x: 960, y: 560, h: 800};
const CAN_WPX = CAN.h * CAN_AR;
const at = (u: number, v: number) => ({x: CAN.x + (u - 0.5) * CAN_WPX, y: CAN.y + (v - 0.5) * CAN.h});

// Same label point and same on-screen scale the hook's dive ended on, so the
// cut lands inside a uniform field of yellow label.
const DIVE = at(DIVE_UV.u, DIVE_UV.v);
const START_ZOOM = (DIVE_END_ZOOM * HOOK_CAN_H) / CAN.h;
const MID = at(0.5, 0.47);
const LOGO = at(0.42, 0.19);
const ILLU = at(0.56, 0.69);

const camera = (f: number): Cam => {
  const fx = track(f, [0, 24, 58, 72, 104], [DIVE.x, MID.x, MID.x, LOGO.x, ILLU.x], [ease.outQuint, ease.linear, ease.inOutExpo, ease.inOutSine]);
  const fy = track(f, [0, 24, 58, 72, 104], [DIVE.y, MID.y, MID.y, LOGO.y, ILLU.y], [ease.outQuint, ease.linear, ease.inOutExpo, ease.inOutSine]);
  const zoom =
    track(f, [0, 22], [START_ZOOM, 1], ease.outExpo) *
    track(f, [22, 58], [1, 1.05], ease.inOutSine) *
    track(f, [58, 72, 104], [1, 1.74, 1.62], [ease.inOutExpo, ease.inOutSine]);
  const pull = track(f, [0, 22, 58, 72], [1, 0, 0, 1], [ease.outQuint, ease.linear, ease.inOutExpo]);
  return {zoom, fx, fy, pull, px: jitter('rvx', f, 0.012, 10), py: jitter('rvy', f, 0.012, 6)};
};

const Marquee: React.FC<{f: number; y: number; text: string; speed: number; size: number}> = ({f, y, text, speed, size}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: y - size * 0.5,
      whiteSpace: 'nowrap',
      transform: `translateX(${-500 - f * speed}px)`,
      ...axes(125, 900),
      fontSize: size,
      lineHeight: 1,
      color: 'transparent',
      WebkitTextStroke: `2.5px ${rgba(C.forest, 0.32)}`,
      letterSpacing: size * 0.01,
    }}
  >
    {`${text} • ${text} • ${text} • ${text}`}
  </div>
);

export const Reveal: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const cam = camera(f);
  const dof = (cam.zoom - 1) * 5; // background defocus grows as we get closer

  const pop = (start: number) => track(f, [start, start + 18], [0, 1], ease.outBack);
  const halo = track(f, [2, 26], [0.55, 1], ease.outExpo);

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.gold}}>
      {/* Studio: amber sky, warm haze, cream floor */}
      <AbsoluteFill style={layer(cam, 0.15)}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${C.amber} 0%, ${C.gold} 34%, #F7D457 60%, #FBE7A2 78%, #FDF0C4 100%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 34% 48% at 50% 50%, ${rgba('#FFF7D6', 0.85)} 0%, ${rgba('#FFF2B8', 0.35)} 45%, ${rgba('#FFF2B8', 0)} 100%)`,
            transform: `scale(${halo})`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{...layer(cam, 0.3), filter: `blur(${(1 + dof * 1.2).toFixed(2)}px)`}}>
        <Bokeh f={f + 90} seed={11} count={26} colors={['#FFFFFF', C.cream, '#FFE9A0']} r={[24, 120]} alpha={[0.14, 0.4]} rise={0.5} />
      </AbsoluteFill>

      <LightRays x={180} y={-120} radius={1900} rot={-6 + f * 0.05} color="#FFF8DC" intensity={0.3} />

      <AbsoluteFill style={{...layer(cam, 0.55), filter: dof > 0.3 ? `blur(${(dof * 0.9).toFixed(2)}px)` : undefined, opacity: track(f, [4, 20], [0, 1])}}>
        <Marquee f={f} y={CAN.y - 10} text="PURE JUICE" speed={3.2} size={270} />
      </AbsoluteFill>

      <Ring f={f} at={0} x={960} y={540} color={C.white} alpha={0.55} maxR={1300} dur={24} width={50} />

      {/* Fruit behind the can */}
      <AbsoluteFill style={layer(cam, 0.7)}>
        <Wedge x={560 + jitter('w1x', f, 0.02, 18)} y={330 + jitter('w1y', f, 0.02, 14)} w={210 * pop(4)} rot={-28 + f * 0.12} blur={2.2 + dof} />
        <Wedge x={1420 + jitter('w2x', f, 0.02, 18)} y={270 + jitter('w2y', f, 0.02, 14)} w={160 * pop(7)} rot={34 - f * 0.1} blur={3.2 + dof} flip />
      </AbsoluteFill>

      {/* Product plane */}
      <MotionBlur frame={f} samples={f < 9 ? 10 : 1} shutter={0.7}>
        {(cf) => (
          <AbsoluteFill style={layer(camera(cf), 1)}>
            <Can
              x={CAN.x}
              y={CAN.y}
              h={CAN.h}
              rot={track(cf, [0, 24], [-5, 0], ease.outBack)}
              shine={track(f, [26, 44], [-0.1, 1.1], ease.inOutCubic)}
              shadow={0.9}
              shadowColor="120,62,0"
              reflection={0.5}
            />
          </AbsoluteFill>
        )}
      </MotionBlur>

      {/* Fruit between can and lens */}
      <AbsoluteFill style={layer(cam, 1.45)}>
        <Wedge x={1370 + jitter('w3x', f, 0.02, 22)} y={850 + jitter('w3y', f, 0.02, 16)} w={360 * pop(3)} rot={-12 + f * 0.08} blur={6 + dof * 1.5} />
        <Wedge x={track(f, [60, 110], [-200, 520], ease.inOutSine)} y={track(f, [60, 110], [120, 330], ease.inOutSine)} w={420} rot={20 + f * 0.25} blur={11} opacity={track(f, [60, 66], [0, 0.9])} flip />
      </AbsoluteFill>

      {/* Exposure flash carried over from the hook's dive */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${C.cream} 0%, ${rgba(C.sun, 0.6)} 45%, ${rgba(C.sun, 0)} 80%)`,
          opacity: track(f, [0, 10], [0.85, 0], ease.outCubic),
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 75% at 50% 50%, rgba(120,60,0,0) 60%, rgba(120,60,0,${lerp(0.22, 0.32, Math.min(1, dof / 4)).toFixed(3)}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
