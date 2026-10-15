import { Composition } from "remotion";
import { QualityShort } from "./Composition";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="RestfulBookerQualityShort"
    component={QualityShort}
    durationInFrames={480}
    fps={30}
    width={1080}
    height={1920}
  />
);
