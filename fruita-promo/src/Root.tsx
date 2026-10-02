import {Composition} from 'remotion';
import {FruitaSpot} from './FruitaSpot';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Fruita"
    component={FruitaSpot}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
