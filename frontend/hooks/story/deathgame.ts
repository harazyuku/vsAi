import type { StoryContext, StoryLine } from "./types";

export function createDeathGameStory({
  topic,
  stance,
  aiStance,
}: StoryContext): StoryLine[] {
  return [
    {
      speaker: "ナレーション",
      text: "出口のない密室。無機質なモニターに、残酷な選択肢が映し出された。",
    },
    {
      speaker: "ナレーション",
      text: topic,
    },
    {
      speaker: "対戦相手",
      side: "enemy",
      text: `生き残るための答えは「${aiStance}」だ。迷っている時間はない。`,
    },
    {
      speaker: "あなた",
      side: "player",
      text: `いや、俺は「${stance}」を選ぶ。命が懸かっているからこそ、言葉で決着をつける。`,
    },
    {
      speaker: "ナレーション",
      text: "制限時間は刻一刻と減っていく。全員の運命を懸けた討論が始まった。",
    },
  ];
}
