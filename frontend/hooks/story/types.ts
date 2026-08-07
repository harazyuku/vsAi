export type StoryActorId =
  | "claude"
  | "mob"
  | "plaintiff"
  | "defendant"
  | "enemy"
  | "player"
  | "heroine"
  | "gamemaster"
  | "gaki1"
  | "gaki2"
  | "gaki3"
  | "gaki4"
  | "sato";

export type StoryLine = {
  speaker:
    | "ナレーション"
    | "あなた"
    | "対戦相手"
    | "Claude Code"
    | "原告側"
    | "被告側"
    | "ゲームマスター"
    | "少女"
    | "参加者"
    | "校長"
    | "佐藤くん"
    | "山田先生"
    | "女子生徒"
    | "クラスメイト";
  text: string;
  side?: "player" | "enemy";
  visibleActors?: StoryActorId[];
  focusActor?: StoryActorId;
  backdrop?: string;
  scene?:
    | "anonymous-chat"
    | "breaking-news"
    | "guardian-ai"
    | "diary"
    | "karaage"
    | "empty-plate"
    | "class-trial";
  revealStance?: "player" | "enemy";
};

export type StoryContext = {
  topic: string;
  stance: string;
  aiStance: string;
  opponentStoryLines?: Record<string, string>;
};

export type StoryActorView = {
  id: StoryActorId;
  src: string;
  alt: string;
  position: "left" | "right";
  placement: "left" | "center-left" | "center" | "right";
  size: "claude" | "ai" | "normal" | "portrait" | "monitor" | "student";
  isFocused: boolean;
  flipX: boolean;
  isAICharacter: boolean;
};
