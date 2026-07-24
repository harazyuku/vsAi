import type { JudgeResult } from "@/app/battle/components/pc/JudgeScreen";
import type { Topic } from "@/app/config/aiConfig";

const BATTLE_RESULT_SESSION_KEY = "battle-result";

export interface BattleResultSession {
  judgeResult: JudgeResult;
  stance: string;
  aiStance: string;
  topicBackground: Topic["background"];
}

export const saveBattleResultSession = (result: BattleResultSession) => {
  sessionStorage.setItem(BATTLE_RESULT_SESSION_KEY, JSON.stringify(result));
};

export const loadBattleResultSession = (): BattleResultSession | null => {
  const savedResult = sessionStorage.getItem(BATTLE_RESULT_SESSION_KEY);

  if (!savedResult) return null;

  try {
    return JSON.parse(savedResult) as BattleResultSession;
  } catch {
    sessionStorage.removeItem(BATTLE_RESULT_SESSION_KEY);
    return null;
  }
};
