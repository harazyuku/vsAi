"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StoryScreen from "../components/pc/StoryScreen";
import MobileStoryScreen from "../components/mobile/MobileStoryScreen";
import IntroScreen from "../components/pc/IntroScreen";
import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";
import { saveBattleSession } from "@/lib/battleSession";

export default function StoryPage() {
  const router = useRouter();
  const game = useGameLogic();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const hasInitialized = useRef(false);

  const {
    selectAi,
    selectStance,
    selectTopic,
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const ai = selectAi();
    const topic = selectTopic();
    const userStance = selectStance(topic);
    const enemyStance = selectAiStance(topic, userStance);

    setSelectedAI(ai);
    setSelectedTopic(topic);
    setStance(userStance);
    setAiStance(enemyStance);
  }, [
    selectAiStance,
    selectAi,
    selectStance,
    selectTopic,
    setAiStance,
    setSelectedAI,
    setSelectedTopic,
    setStance,
  ]);

  const finishIntro = useCallback(() => {
    setShowIntro(false);
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
    <main className="h-[100dvh] overflow-hidden bg-black text-white">
      {showIntro && selectedAI && selectedTopic ? (
        <IntroScreen
          selectedAI={selectedAI}
          selectedTopic={selectedTopic}
          onComplete={finishIntro}
        />
      ) : isMobile === null ? null : isMobile ? (
        <MobileStoryScreen {...game} onComplete={startBattle} />
      ) : (
        <StoryScreen {...game} onComplete={startBattle} />
      )}
    </main>
  );
}
