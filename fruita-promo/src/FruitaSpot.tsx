import {AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain} from './components/Fx';
import {DirBlurDef} from './components/MotionBlur';
import {ease, track} from './lib/anim';
import {Hero} from './scenes/Hero';
import {Hook} from './scenes/Hook';
import {Reveal} from './scenes/Reveal';
import {Showcase} from './scenes/Showcase';
import {ACTS} from './theme';

// Reveal → Showcase: one continuous whip pan (accelerate, peak on the cut,
// decelerate). Both acts sit side by side on one strip and the blur is
// applied to the strip, so the seam between them smears like a real pan.
const WHIP = {from: 200, to: 216};
const whip = (f: number) => track(f, [WHIP.from, WHIP.to], [0, -1920], ease.inOutExpo);

export const FruitaSpot: React.FC = () => {
  const f = useCurrentFrame();
  const v = whip(f + 0.5) - whip(f - 0.5);
  const blur = Math.min(90, Math.abs(v) * 0.14);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <DirBlurDef id="whip" x={blur} />
      <Sequence from={ACTS.hook.from} durationInFrames={ACTS.hook.dur}>
        <Hook />
      </Sequence>
      <Sequence from={ACTS.reveal.from} durationInFrames={ACTS.hero.from - ACTS.reveal.from}>
        <AbsoluteFill style={{transform: `translateX(${whip(f)}px)`, filter: blur > 0.6 ? 'url(#whip)' : undefined}}>
          <Sequence durationInFrames={WHIP.to - ACTS.reveal.from}>
            <Reveal />
          </Sequence>
          <Sequence from={WHIP.from - ACTS.reveal.from}>
            <AbsoluteFill style={{transform: 'translateX(1920px)'}}>
              <Showcase offset={WHIP.from - ACTS.showcase.from} />
            </AbsoluteFill>
          </Sequence>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={ACTS.hero.from} durationInFrames={ACTS.hero.dur}>
        <Hero />
      </Sequence>
      <Grain f={f} opacity={0.06} />
      <Html5Audio src={staticFile('audio/fruita.wav')} />
    </AbsoluteFill>
  );
};
