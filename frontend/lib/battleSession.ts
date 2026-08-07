import type { AICharacter, Topic } from "@/app/config/aiConfig";

const BATTLE_SESSION_KEY = "vs-ai:battle-session";

export type BattleSession = {
  selectedAI: AICharacter;
  selectedTopic: Topic;
  stance: string;
  aiStance: string;
};

export function saveBattleSession(session: BattleSession) {
  window.sessionStorage.setItem(BATTLE_SESSION_KEY, JSON.stringify(session));
}

export function loadBattleSession(): BattleSession | null {
  const storedSession = window.sessionStorage.getItem(BATTLE_SESSION_KEY);
  if (!storedSession) return null;

  try {
    return JSON.parse(storedSession) as BattleSession;
  } catch {
    return null;
  }
}
