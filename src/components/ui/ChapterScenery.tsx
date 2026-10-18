import { WorldModel } from "./WorldModel";

export function ChapterScenery({ space }: { space: 0 | 1 | 2 }) {
  return <div className="chapter-scenery" data-cursor="art">
    <WorldModel mode="single" space={space} />
  </div>;
}
