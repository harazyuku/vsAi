import type { StoryContext, StoryLine } from "./types";

export function createSchoolStory({
  topic,
  stance,
  aiStance,
}: StoryContext): StoryLine[] {
  return [
    {
      speaker: "ナレーション",
      text: "放課後の校舎。臨時の全校集会を前に、ひとつの校則を巡る議論が始まろうとしていた。",
    },
    {
      speaker: "ナレーション",
      text: topic,
    },
    {
      speaker: "対戦相手",
      side: "enemy",
      text: `学校の未来を考えるなら、答えは「${aiStance}」だ。感情だけで決める問題じゃない。`,
    },
    {
      speaker: "あなた",
      side: "player",
      text: `こちらの立場は「${stance}」。その考えが本当に生徒のためになるのか、確かめさせてもらう。`,
    },
    {
      speaker: "ナレーション",
      text: "教師と生徒たちが見守る中、校内の未来を決める討論の幕が上がる。",
    },
  ];
}
