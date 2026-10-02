import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DURATION = 450;

// 120 BPM: one beat every 15 frames. The music is written with a two-beat
// pickup, so bars land on 30, 90, 150, 210, 270, 330, 390 — and every act
// change (90 / 210 / 330) falls on a downbeat.
export const BEAT = 15;

export const ACTS = {
  hook: {from: 0, dur: 90},
  reveal: {from: 90, dur: 120},
  showcase: {from: 210, dur: 120},
  hero: {from: 330, dur: 120},
} as const;

// Sampled from the packaging: logo green, the lime-to-amber label gradient
// and the creamy highlight band. Nothing outside this family is used.
export const C = {
  forest: '#1B5A2B',
  forestHi: '#2A7438',
  deep: '#0D2E17',
  deeper: '#061509',
  lime: '#CBD64C',
  sun: '#F6CF3E',
  gold: '#F0B32B',
  amber: '#E3971F',
  cream: '#FFF5D2',
  white: '#FFFDF4',
};

export const FONT = 'Archivo';

loadFont({
  family: FONT,
  url: staticFile('fonts/archivo-wdth.woff2'),
  weight: '100 900',
  stretch: '62% 125%',
});

// Variable axes as a style object — width and weight are animated directly.
export const axes = (wdth: number, wght: number) => ({
  fontFamily: FONT,
  fontVariationSettings: `'wdth' ${wdth.toFixed(2)}, 'wght' ${wght.toFixed(1)}`,
});

export const IMG = {
  can: staticFile('img/can.png'),
  canReal: staticFile('img/can-real.png'),
  wedge: staticFile('img/wedge.png'),
  tray: staticFile('img/fruita-tray.jpg'),
  sixpack: staticFile('img/fruita-sixpack.jpg'),
  desk: staticFile('img/fruita-can-desk.jpg'),
  keyvisual: staticFile('img/fruita-keyvisual.jpg'),
};

// Native pixel sizes of the cut-outs.
export const CAN_W = 500;
export const CAN_H = 959;
export const CAN_AR = CAN_W / CAN_H;
export const REAL_AR = 325 / 584;
export const WEDGE_AR = 319 / 235;
