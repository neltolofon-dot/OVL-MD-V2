import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Per-layer motion blur. Renders `children(t)` at `samples` sub-frame times
 * spread over the shutter interval and averages them (plus-lighter at 1/n is
 * a premultiplied average, so transparent layers composite correctly).
 * Unlike <CameraMotionBlur>, it is scoped to one layer and only pays for
 * extra samples while `samples > 1` — callers pass 1 when the layer is still.
 */
export const MotionBlur: React.FC<{
  frame: number;
  samples: number;
  shutter?: number; // in frames (1 = 360° shutter)
  children: (f: number) => React.ReactNode;
}> = ({frame, samples, shutter = 0.5, children}) => {
  const n = Math.max(1, Math.round(samples));
  if (n === 1) return <AbsoluteFill>{children(frame)}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      {new Array(n).fill(0).map((_, i) => {
        const f = frame + shutter * (i / (n - 1) - 0.5);
        return (
          <AbsoluteFill key={i} style={{mixBlendMode: 'plus-lighter', opacity: 1 / n}}>
            {children(f)}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** Sample count that scales with on-screen speed (px/frame). */
export const samplesFor = (speed: number, max = 10) => {
  const s = Math.abs(speed);
  if (s < 2) return 1;
  return Math.min(max, Math.ceil(2 + s / 6));
};

/**
 * Directional gaussian blur as an inline SVG filter, referenced with
 * `filter: url(#id)`. Used for whip pans and type flying out.
 */
export const DirBlurDef: React.FC<{id: string; x: number; y?: number}> = ({id, x, y = 0}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${Math.abs(x).toFixed(2)} ${Math.abs(y).toFixed(2)}`} />
      </filter>
    </defs>
  </svg>
);
