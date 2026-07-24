export type StoryLine = {
  speaker: "ナレーション" | "あなた" | "対戦相手";
  text: string;
  side?: "player" | "enemy";
};

export type StoryContext = {
  topic: string;
  stance: string;
  aiStance: string;
};
