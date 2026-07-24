export type StoryActorId =
  | "claude"
  | "mob"
  | "plaintiff"
  | "defendant"
  | "enemy";

export type StoryLine = {
  speaker: "ナレーション" | "あなた" | "対戦相手" | "Claude Code" | "原告側" | "被告側";
  text: string;
  side?: "player" | "enemy";
  visibleActors?: StoryActorId[];
  focusActor?: StoryActorId;
  backdrop?: string;
  revealStance?: "player" | "enemy";
};

export type StoryContext = {
  topic: string;
  stance: string;
  aiStance: string;
};

export type StoryActorView = {
  id: StoryActorId;
  src: string;
  alt: string;
  position: "left" | "right";
  placement: "left" | "center-left" | "right";
  size: "claude" | "ai" | "normal";
  isFocused: boolean;
  flipX: boolean;
  isAICharacter: boolean;
};
