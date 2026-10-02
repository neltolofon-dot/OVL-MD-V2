import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {Can} from '../components/Can';
import {Bokeh, PineSlice, Ring, rgba} from '../components/Fx';
import {DirBlurDef, MotionBlur, samplesFor} from '../components/MotionBlur';
import {axes, C, CAN_AR, CAN_H, CAN_W, IMG} from '../theme';
import {clamp, ease, jitter, lerp, progress, speedRamp, track} from '../lib/anim';

/**
 * 7 – 11 s · SHOWCASE — four beats, four techniques, one claim each:
 *   S1 "100%"          odometer counter; the zeros turn into pineapple slices,
 *                      the camera dives through one of them (shape match cut)
 *   S2 "PINEAPPLE"     the can tears across on a speed ramp and the letters
 *                      ripple in its wake (type reacting to the product)
 *   S3 "NO ADDED…"     diagonal shape wipe, variable-width type, can rises
 *   S4 real photos     8th-note montage of the real product in a card that
 *                      morphs into the can itself (true match cut: the hero
 *                      cut-out comes from the last photo of the montage)
 */

// ---------------------------------------------------------------- S1 · 100%
const DIG = 440;
const GLYPHS = [
  {ch: '1', w: 0.52},
  {ch: '0', w: 0.68},
  {ch: '0', w: 0.68},
  {ch: '%', w: 0.98},
];
const ROW_W = GLYPHS.reduce((s, g) => s + g.w, 0) * DIG;
const ROW_X = 960 - ROW_W / 2;
const glyphCenter = (i: number) => ROW_X + (GLYPHS.slice(0, i).reduce((s, g) => s + g.w, 0) + GLYPHS[i].w / 2) * DIG;
const DIGIT_CY = 552; // optical centre of the figures
const counter = (f: number) => 100 * ease.outQuint(progress(f, 1, 17));
const sliceIn = (f: number, i: number) => track(f, [16 + i * 4, 24 + i * 4], [0, 1], ease.outBack);
const diveZoom = (f: number) => track(f, [22, 30], [1, 18], ease.inExpo);
const DIVE = {x: glyphCenter(2) + 0.17 * DIG, y: DIGIT_CY - 0.05 * DIG};

const OdoColumn: React.FC<{value: number; speed: number; id: string; w: number; fade: number}> = ({value, speed, id, w, fade}) => {
  const m = ((value % 10) + 10) % 10;
  const blur = Math.min(70, Math.abs(speed) * DIG * 0.09);
  return (
    <div style={{width: w * DIG, height: DIG, overflow: 'hidden', position: 'relative', opacity: fade}}>
      <DirBlurDef id={id} x={0} y={blur} />
      <div style={{transform: `translateY(${-m * DIG}px)`, filter: blur > 0.6 ? `url(#${id})` : undefined}}>
        {new Array(11).fill(0).map((_, d) => (
          <div key={d} style={{height: DIG, lineHeight: `${DIG}px`, textAlign: 'center'}}>
            {d % 10}
          </div>
        ))}
      </div>
    </div>
  );
};

const S1: React.FC<{f: number}> = ({f}) => {
  const v = counter(f);
  const dv = counter(f + 0.5) - counter(f - 0.5);
  const land = track(f, [15, 17, 24], [1, 1.04, 1], [ease.outCubic, ease.outBack]);
  const z = diveZoom(f);
  const pull = track(f, [22, 30], [0, 1], ease.inOutCubic);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 80% at 50% 50%, #164E27 0%, ${C.deep} 60%, ${C.deeper} 100%)`, overflow: 'hidden'}}>
      <MotionBlur frame={f} samples={f >= 23 ? 14 : 1} shutter={0.5}>
        {(ff) => {
          const zz = diveZoom(ff);
          const pp = track(ff, [22, 30], [0, 1], ease.inOutCubic);
          return (
            <AbsoluteFill
              style={{
                transform: `translate(${(960 - DIVE.x) * pp}px, ${(540 - DIVE.y) * pp}px) scale(${zz})`,
                transformOrigin: `${DIVE.x}px ${DIVE.y}px`,
              }}
            >
              <Ring f={f} at={16} x={960} y={540} color={C.sun} alpha={0.35} />
              <div
                style={{
                  position: 'absolute',
                  left: ROW_X,
                  top: DIGIT_CY - DIG / 2,
                  display: 'flex',
                  ...axes(112, 900),
                  fontSize: DIG,
                  color: C.sun,
                  fontVariantNumeric: 'tabular-nums',
                  transform: `scale(${land})`,
                  transformOrigin: '50% 50%',
                  textShadow: zz < 1.3 ? `0 0 80px ${rgba(C.gold, 0.25)}` : undefined,
                }}
              >
                <OdoColumn value={v / 100} speed={dv / 100} id="odo-h" w={GLYPHS[0].w} fade={1} />
                <OdoColumn value={v / 10} speed={dv / 10} id="odo-t" w={GLYPHS[1].w} fade={1 - sliceIn(f, 0)} />
                <OdoColumn value={v} speed={dv} id="odo-u" w={GLYPHS[2].w} fade={1 - sliceIn(f, 1)} />
                <div style={{width: GLYPHS[3].w * DIG, height: DIG, lineHeight: `${DIG}px`, textAlign: 'center', opacity: progress(f, 0, 4)}}>%</div>
              </div>
              {[1, 2].map((gi, k) => {
                const s = sliceIn(f, k);
                if (s <= 0) return null;
                const size = 0.74 * DIG * s;
                return (
                  <PineSlice
                    key={gi}
                    size={size}
                    rot={f * 7 + k * 40}
                    style={{position: 'absolute', left: glyphCenter(gi) - size / 2, top: DIGIT_CY - size / 2, filter: zz < 1.3 ? 'drop-shadow(0 10px 30px rgba(0,0,0,0.35))' : undefined}}
                  />
                );
              })}
            </AbsoluteFill>
          );
        }}
      </MotionBlur>
      <AbsoluteFill style={{background: '#FBE27A', opacity: track(f, [27, 30], [0, 1], ease.inQuint) * (z > 1 ? 1 : 0) * clamp(pull * 2)}} />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------- S2 · PINEAPPLE
const WORD = 'PINEAPPLE';
const WORD_SIZE = 250;
// Approximate advances (em) of Archivo Black at wdth 112 — only used to
// locate letters for the wake effect, layout itself is the browser's.
const ADV: Record<string, number> = {P: 0.74, I: 0.36, N: 0.84, E: 0.7, A: 0.84, L: 0.66};
const WORD_W = WORD.split('').reduce((s, c) => s + ADV[c], 0) * WORD_SIZE;
const letterX = (i: number) => 960 - WORD_W / 2 + (WORD.slice(0, i).split('').reduce((s, c) => s + ADV[c], 0) + ADV[WORD[i]] / 2) * WORD_SIZE;
const flyX = (f: number) => lerp(2500, -620, speedRamp(progress(f, 31, 60), 0.86));

const S2: React.FC<{f: number}> = ({f}) => {
  const canX = flyX(f);
  const vx = flyX(f + 0.5) - flyX(f - 0.5);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 80% at 50% 45%, #FBE27A 0%, ${C.sun} 48%, ${C.gold} 100%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', ...axes(112, 900), fontSize: WORD_SIZE, lineHeight: 1, color: C.forest, transform: 'translateY(-6px)'}}>
          {WORD.split('').map((ch, i) => {
            const s = 30 + i * 1.3;
            const p = ease.outExpo(progress(f, s, s + 12));
            const bump = Math.exp(-Math.pow((letterX(i) - canX) / 250, 2));
            const side = Math.sign(letterX(i) - canX) || 1;
            return (
              <div key={i} style={{overflow: 'hidden', paddingTop: 70, marginTop: -70}}>
                <div
                  style={{
                    transform: `translate(${side * bump * 26}px, ${(1 - p) * WORD_SIZE * 1.1 - bump * 46}px) rotate(${side * bump * 7}deg) scale(${1 + bump * 0.09})`,
                    fontVariationSettings: `'wdth' ${(112 + bump * 13).toFixed(2)}, 'wght' 900`,
                  }}
                >
                  {ch}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <MotionBlur frame={f} samples={samplesFor(vx * 0.6)} shutter={0.6}>
        {(ff) => {
          const x = flyX(ff);
          const v = flyX(ff + 0.5) - flyX(ff - 0.5);
          return (
            <Can
              x={x}
              y={560 + jitter('s2y', ff, 0.05, 10)}
              h={880}
              rot={clamp(-v * 0.14, -14, 14)}
              shadow={0.6}
              shadowColor="120,62,0"
            />
          );
        }}
      </MotionBlur>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------- S3 · NO ADDED CHEMICALS
const S3: React.FC<{f: number}> = ({f}) => {
  const lines = [
    {text: 'NO ADDED', start: 59, size: 134},
    {text: 'CHEMICALS', start: 63, size: 134},
  ];
  const canY = track(f, [60, 75], [1500, 548], ease.outBack);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 90% at 60% 50%, #FFFAE6 0%, ${C.cream} 55%, #F8E3A2 100%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 150, top: 318}}>
        <div
          style={{
            ...axes(110, 800),
            fontSize: 32,
            letterSpacing: '0.32em',
            color: C.forestHi,
            opacity: progress(f, 60, 66),
            transform: `translateY(${lerp(18, 0, ease.outExpo(progress(f, 60, 70)))}px)`,
            marginBottom: 18,
          }}
        >
          100% PINEAPPLE
        </div>
        {lines.map((l, li) => (
          <div key={li} style={{display: 'flex', height: l.size * 0.92, alignItems: 'flex-end', ...axes(125, 900), fontSize: l.size, lineHeight: 1, color: C.forest}}>
            {l.text.split('').map((ch, i) => {
              const s = l.start + i * 0.9;
              const p = progress(f, s, s + 11);
              const pe = ease.outExpo(p);
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    whiteSpace: 'pre',
                    fontVariationSettings: `'wdth' ${lerp(62, 125, pe).toFixed(2)}, 'wght' ${lerp(500, 900, pe).toFixed(0)}`,
                    opacity: clamp(p * 4),
                    transform: `translateY(${lerp(40, 0, ease.outBack(p))}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
        <div
          style={{
            marginTop: 30,
            height: 12,
            width: 260 * ease.outExpo(progress(f, 70, 82)),
            borderRadius: 6,
            background: `linear-gradient(90deg, ${C.gold}, ${C.lime})`,
          }}
        />
      </div>
      <Can
        x={1530}
        y={canY}
        h={800}
        rot={track(f, [60, 78], [9, 0], ease.outBack)}
        shine={track(f, [74, 88], [-0.1, 1.1], ease.inOutCubic)}
        shadow={track(f, [68, 76], [0, 0.8])}
        shadowColor="120,62,0"
        reflection={0.35}
      />
    </AbsoluteFill>
  );
};

// ------------------------------------------------- S4 · montage → match cut
const CARD = {w: 1180, h: 700, r: 36};
const TARGET_H = 870; // can height at the hand-off to the hero shot
const TARGET_S = TARGET_H / CAN_H;
// Position of the hero can inside the (watermark-cropped) key visual photo.
const KV = {w: 1820, h: 1493, canCx: 762 + CAN_W / 2, canCy: 349 + CAN_H / 2};

type Shot = {src: string; at: number; w: number; h: number; ox: number; oy: number};
const SHOTS: Shot[] = [
  {src: IMG.tray, at: 90, w: 960, h: 1280, ox: 0.5, oy: 0.58},
  {src: IMG.sixpack, at: 97, w: 960, h: 1280, ox: 0.5, oy: 0.52},
  {src: IMG.desk, at: 105, w: 960, h: 1280, ox: 0.5, oy: 0.5},
  {src: IMG.keyvisual, at: 112, w: KV.w, h: KV.h, ox: 0.5, oy: 0.5},
];

const S4: React.FC<{f: number}> = ({f}) => {
  const idx = SHOTS.reduce((acc, s, i) => (f >= s.at ? i : acc), 0);
  const shot = SHOTS[idx];
  const since = f - shot.at;
  const pulse = 1 + 0.05 * Math.exp(-since / 2.5);
  const morph = ease.inOutCubic(progress(f, 113, 120));

  // Card geometry morphs from the wide frame to the can's bounding box.
  const cw = lerp(CARD.w, CAN_W * TARGET_S, morph) * (morph > 0 ? 1 : pulse);
  const ch = lerp(CARD.h, TARGET_H, morph) * (morph > 0 ? 1 : pulse);
  const cr = lerp(CARD.r, 46, morph);
  const tilt = morph > 0 ? lerp(idx % 2 ? 1.2 : -1.2, 0, morph) : idx % 2 ? 1.2 : -1.2;

  // Photo framing inside the card (cover-fit + slow push). For the key visual
  // the framing converges so that its centre can lands exactly on the hero.
  let photo: React.CSSProperties;
  if (idx < 3) {
    const cover = Math.max(CARD.w / shot.w, CARD.h / shot.h) * (1.06 + since * 0.006);
    photo = {
      width: shot.w * cover,
      height: shot.h * cover,
      left: cw / 2 - shot.w * cover * shot.ox,
      top: ch / 2 - shot.h * cover * shot.oy,
    };
  } else {
    const s = lerp(Math.max(CARD.w / KV.w, CARD.h / KV.h) * 1.05, TARGET_S, morph);
    photo = {width: KV.w * s, height: KV.h * s, left: cw / 2 - KV.canCx * s, top: ch / 2 - KV.canCy * s};
  }
  const cutout = progress(f, 117, 120);

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 80% at 50% 50%, #133F20 0%, ${C.deep} 55%, ${C.deeper} 100%)`, overflow: 'hidden'}}>
      <Bokeh f={f + 300} seed={23} count={18} colors={[C.gold, C.sun, C.amber]} r={[20, 90]} alpha={[0.06, 0.2]} rise={0.6} />
      {SHOTS.map((s) => (
        <Ring key={s.at} f={f} at={s.at} x={960} y={540} color={C.sun} alpha={0.22} maxR={1200} dur={14} width={18} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 960 - cw / 2,
          top: 540 - ch / 2,
          width: cw,
          height: ch,
          borderRadius: cr,
          overflow: 'hidden',
          transform: `rotate(${tilt}deg)`,
          boxShadow: `0 40px 90px rgba(0,0,0,${(0.45 * (1 - cutout)).toFixed(3)})`,
          opacity: 1 - cutout,
        }}
      >
        <Img src={shot.src} style={{position: 'absolute', ...photo}} />
        <AbsoluteFill style={{boxShadow: `inset 0 0 0 2px ${rgba(C.sun, 0.35)}`, borderRadius: cr}} />
      </div>
      {cutout > 0 ? <Can x={960} y={540} h={TARGET_H} opacity={cutout} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- assembly
const wipeEdge = (f: number) => track(f, [55, 63], [-420, 2340], ease.inOutExpo);
const pushUp = (f: number) => track(f, [85, 93], [0, -1080], ease.inOutExpo);

export const Showcase: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const edge = wipeEdge(f);
  const skew = 260;
  const push = pushUp(f);
  const vPush = pushUp(f + 0.5) - pushUp(f - 0.5);
  const vBlur = Math.min(70, Math.abs(vPush) * 0.16);

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.deeper}}>
      <DirBlurDef id="sc-push" x={0} y={vBlur} />
      {f < 30 ? <S1 f={f} /> : null}
      {f >= 30 && f < 64 ? <S2 f={f} /> : null}
      {f >= 54 && f < 94 ? (
        <AbsoluteFill
          style={{
            clipPath: f < 63 ? `polygon(0 0, ${edge + skew}px 0, ${edge - skew}px 1080px, 0 1080px)` : undefined,
            transform: `translateY(${push}px)`,
            filter: vBlur > 0.6 ? 'url(#sc-push)' : undefined,
          }}
        >
          <S3 f={f} />
        </AbsoluteFill>
      ) : null}
      {f >= 54 && f < 64 ? (
        <AbsoluteFill
          style={{
            background: C.forest,
            clipPath: `polygon(${edge + skew}px 0, ${edge + skew + 110}px 0, ${edge - skew + 110}px 1080px, ${edge - skew}px 1080px)`,
          }}
        />
      ) : null}
      {f >= 85 ? (
        <AbsoluteFill style={{transform: `translateY(${push + 1080}px)`, filter: vBlur > 0.6 ? 'url(#sc-push)' : undefined}}>
          <S4 f={f} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const SHOWCASE_HANDOFF = {x: 960, y: 540, h: TARGET_H, ar: CAN_AR};
