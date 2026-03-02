import {Composition} from 'remotion';
import {BrickHeroReplica} from './BrickHeroReplica';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BrickAIHeroReplica"
        component={BrickHeroReplica}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
