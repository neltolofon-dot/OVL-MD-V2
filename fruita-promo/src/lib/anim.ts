import {noise2D} from '@remotion/noise';
import {Easing} from 'remotion';
import {FPS} from '../theme';

export type Ease = (t: number) => number;

// Custom curves. Everything in the spot goes through one of these — nothing
// is linear except continuous drifts.
export const ease = {
  linear: (t: number) => t,
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  inExpo: Easing.bezier(0.7, 0, 0.84, 0),
  inOutExpo: Easing.bezier(0.87, 0, 0.13, 1),
  outQuint: Easing.bezier(0.22, 1, 0.36, 1),
  inQuint: Easing.bezier(0.64, 0, 0.78, 0),
  inOutQuint: Easing.bezier(0.83, 0, 0.17, 1),
  outCubic: Easing.bezier(0.33, 1, 0.68, 1),
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
  inOutSine: Easing.bezier(0.37, 0, 0.63, 1),
  // Subtle overshoot, for landings.
  outBack: Easing.bezier(0.34, 1.45, 0.64, 1),
  // Anticipation: pulls back before leaving.
  inBack: Easing.bezier(0.36, 0, 0.66, -0.5),
  // Hard start, long silky tail: the signature "snap" of the spot.
  snap: Easing.bezier(0.05, 0.7, 0.1, 1),
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (f: number, start: number, end: number) =>
  clamp((f - start) / (end - start));

/**
 * After-Effects style keyframe track: `frames` are keyframe times, `values`
 * the values at those times, `eases` the curve used for each segment.
 * Holds the first/last value outside the range. Works with fractional
 * frames, which the motion-blur samplers rely on.
 */
export const track = (
  f: number,
  frames: number[],
  values: number[],
  eases: Ease | Ease[] = ease.inOutCubic,
): number => {
  if (f <= frames[0]) return values[0];
  const last = frames.length - 1;
  if (f >= frames[last]) return values[last];
  let i = 0;
  while (f > frames[i + 1]) i++;
  const t = (f - frames[i]) / (frames[i + 1] - frames[i]);
  const e = Array.isArray(eases) ? eases[i] ?? ease.inOutCubic : eases;
  return values[i] + (values[i + 1] - values[i]) * e(t);
};

/**
 * Closed-form damped spring (0 → 1). Unlike remotion's spring() it is an
 * analytic function of time, so it can be sampled between frames.
 */
export const springAt = (
  f: number,
  start: number,
  {freq = 2.4, damping = 0.45}: {freq?: number; damping?: number} = {},
) => {
  const t = (f - start) / FPS;
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const z = damping;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w * t) * (1 + w * t);
};

/** Damped oscillation around 0 — the "settle" after an impact. */
export const wobble = (f: number, start: number, amp: number, periodFrames: number, decayFrames: number) => {
  const t = f - start;
  if (t < 0) return 0;
  return amp * Math.exp(-t / decayFrames) * Math.sin((2 * Math.PI * t) / periodFrames);
};

/** Organic jitter, in [-amp, amp]. */
export const jitter = (seed: string, f: number, speed: number, amp: number) =>
  noise2D(seed, f * speed, 0) * amp;

/**
 * Speed ramp: maps linear progress to a fast → slow → fast curve
 * (`hold` = how much of the middle is spent near-stationary).
 */
export const speedRamp = (t: number, hold = 0.75) => {
  const u = clamp(t) * 2 - 1;
  const cubic = Math.sign(u) * Math.pow(Math.abs(u), 3);
  return (lerp(u, cubic, hold) + 1) / 2;
};

/** Deterministic PRNG (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Numerical velocity of any track, in units per frame. */
export const velocity = (fn: (f: number) => number, f: number) => (fn(f + 0.5) - fn(f - 0.5));
