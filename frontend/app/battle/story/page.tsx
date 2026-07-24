"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import StoryScreen from "../components/pc/StoryScreen";
import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";
import { saveBattleSession } from "@/lib/battleSession";

export default function StoryPage() {
  const router = useRouter();
  const game = useGameLogic();

  const {
    selectAi,
    selectTopic,
    selectStance,
    selectAiStance,
    setSelectedAI,
    setSelectedTopic,
    setStance,
    setAiStance,
    selectedAI,
    selectedTopic,
    stance,
    aiStance,
  } = game;

  useEffect(() => {
    const ai = selectAi();
    const topic = selectTopic();
    const userStance = selectStance(topic);
    const enemyStance = selectAiStance(topic, userStance);

    setSelectedAI(ai);
    setSelectedTopic(topic);
    setStance(userStance);
    setAiStance(enemyStance);
  }, []);

  const startBattle = useCallback(() => {
    if (!selectedAI || !selectedTopic) return;

    saveBattleSession({
      selectedAI,
      selectedTopic,
      stance,
      aiStance,
    });

    router.replace("/battle");
  }, [aiStance, router, selectedAI, selectedTopic, stance]);

  return (
    <main className="h-screen overflow-hidden bg-black text-white">
      <StoryScreen {...game} onComplete={startBattle} />
    </main>
  );
}
