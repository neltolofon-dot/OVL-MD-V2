import React from 'react';
import {Img} from 'remotion';
import {CAN_AR, IMG} from '../theme';
import {clamp} from '../lib/anim';

type CanProps = {
  x: number; // centre, px
  y: number;
  h: number; // rendered height, px
  rot?: number;
  scale?: number;
  origin?: string;
  src?: string;
  ar?: number;
  /** Light sweep position: 0 → 1 crosses the can, outside = no sweep. */
  shine?: number;
  /** Ground contact shadow strength (0 – 1). */
  shadow?: number;
  shadowColor?: string;
  /** Floor reflection strength (0 – 1). */
  reflection?: number;
  /** Golden rim glow (0 – 1), separates the can from dark backdrops. */
  glow?: number;
  blur?: number;
  opacity?: number;
};

/**
 * The hero. The photo is never recoloured or distorted: everything here is
 * light added on top (sweep, glow) or around it (shadow, reflection).
 */
export const Can: React.FC<CanProps> = ({
  x,
  y,
  h,
  rot = 0,
  scale = 1,
  origin = '50% 50%',
  src = IMG.can,
  ar = CAN_AR,
  shine,
  shadow = 0,
  shadowColor = '0,0,0',
  reflection = 0,
  glow = 0,
  blur = 0,
  opacity = 1,
}) => {
  const w = h * ar;
  const showShine = shine !== undefined && shine > -0.05 && shine < 1.05;
  const p = (shine ?? 0) * 150 - 25; // sweep travels from -25% to 125%
  const mask = {
    WebkitMaskImage: `url(${src})`,
    WebkitMaskSize: '100% 100%',
    maskImage: `url(${src})`,
    maskSize: '100% 100%',
  } as React.CSSProperties;
  const filters = [
    glow > 0 ? `drop-shadow(0 0 ${(38 * glow).toFixed(1)}px rgba(246,207,62,${(0.42 * glow).toFixed(3)}))` : '',
    blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {shadow > 0 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: x - w * 0.75,
              top: y + (h / 2) * scale - w * 0.13,
              width: w * 1.5,
              height: w * 0.26,
              borderRadius: '50%',
              background: `radial-gradient(closest-side, rgba(${shadowColor},${0.42 * shadow}), rgba(${shadowColor},0))`,
              opacity,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: x - w * 0.48,
              top: y + (h / 2) * scale - w * 0.05,
              width: w * 0.96,
              height: w * 0.08,
              borderRadius: '50%',
              background: `radial-gradient(closest-side, rgba(${shadowColor},${0.55 * shadow}), rgba(${shadowColor},0))`,
              opacity,
            }}
          />
        </>
      ) : null}
      {reflection > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: x - (w / 2) * scale,
            top: y + (h / 2) * scale - 2,
            width: w * scale,
            height: h * scale * 0.45,
            overflow: 'hidden',
            opacity: reflection * opacity,
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.42), rgba(0,0,0,0) 72%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.42), rgba(0,0,0,0) 72%)',
            filter: 'blur(1.5px)',
          }}
        >
          <Img
            src={src}
            style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${100 / 0.45}%`, transform: 'scaleY(-1)'}}
          />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: x - w / 2,
          top: y - h / 2,
          width: w,
          height: h,
          transform: `rotate(${rot}deg) scale(${scale})`,
          transformOrigin: origin,
          opacity,
          filter: filters || undefined,
        }}
      >
        <Img src={src} style={{width: '100%', height: '100%', display: 'block'}} />
        {showShine ? (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                ...mask,
                background: `linear-gradient(104deg, rgba(255,255,255,0) ${p - 22}%, rgba(255,255,255,0.55) ${p}%, rgba(255,255,255,0) ${p + 22}%)`,
                mixBlendMode: 'soft-light',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                ...mask,
                background: `linear-gradient(104deg, rgba(255,250,225,0) ${p - 6}%, rgba(255,250,225,${(0.5 * clamp(1 - Math.abs((shine ?? 0) - 0.5) * 1.6)).toFixed(3)}) ${p}%, rgba(255,250,225,0) ${p + 6}%)`,
                mixBlendMode: 'screen',
              }}
            />
          </>
        ) : null}
      </div>
    </>
  );
};
