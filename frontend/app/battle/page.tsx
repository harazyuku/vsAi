"use client";

import { useEffect, useState } from "react";
import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";
import IntroScreen from "./components/IntroScreen";
import TeamScreen from "./components/TeamScreen";
import BattleScreen from "./components/BattleScreen";
import CourtBackground from "./components/Background/CourtBackground";
import DeathGameBackground from "./components/Background/DeathGameBackground";
import SchoolBackground from "./components/Background/SchoolBackground";
import RoundScreen from "./components/RoundScreen";
import JudgeScreen from "./components/JudgeScreen";

export default function Page() {
  const game = useGameLogic();

  const [screen, setScreen] = useState<"intro" | "team" | "battle" | "judge">("intro");
  const [showIntro, setShowIntro] = useState(true);
  const [showRoundScreen, setShowRoundScreen] = useState(false);

  const {
    selectAi,
    selectTopic,
    selectStance,
    selectAiStance,
    setSelectedAI,
    setSelectedTopic,
    setStance,
    setAiStance,
    round,
    judge
  } = game;

  // 初期化フロー
  useEffect(() => {
    const ai = selectAi();

    const topic = selectTopic();

    const userStance = selectStance(topic);

    const aiStance = selectAiStance(topic, userStance);

    setSelectedAI(ai);
    setSelectedTopic(topic);
    setStance(userStance);
    setAiStance(aiStance);
  }, []);

  // ラウンド監視
  useEffect(() => {
    if (round === 6) {
      setScreen("judge");
      judge();
    }
  }, [round]);

  // introScreenを消す
  const closeIntro = () => {
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 z-0">
        {game.selectedTopic?.background === "court" && (
          <CourtBackground key="court" />
        )}

        {game.selectedTopic?.background === "deathgame" && (
          <DeathGameBackground key="deathgame" />
        )}

        {game.selectedTopic?.background === "school" && (
          <SchoolBackground key="school" />
        )}

        <div className="absolute inset-0 bg-black/50" />
      </div>

      {showIntro && (
        <div className="z-20 flex items-center justify-center absolute inset-0">
          <IntroScreen
            {...game}
            onChangeScreen={() => setScreen("team")}
            closeIntro={closeIntro}
          />
        </div>
      )}

      <div className="z-10 absolute inset-0 flex items-center justify-center">
        {screen === "team" && (
          <TeamScreen
            {...game}
            onChangeScreen={() => setScreen("battle")}
            setShowRoundScreen={setShowRoundScreen}
          />
        )}

        {screen === "battle" && (
          <BattleScreen
            {...game}
            onChangeScreen={() => setScreen("team")}
            setShowRoundScreen={setShowRoundScreen}
          />
        )}

        {screen === "judge" && (
          <JudgeScreen
            judgeResult={game.judgeResult}
          />
        )}
      </div>

      {showRoundScreen && screen !== "intro" && screen !== "judge" && (
        <RoundScreen
          {...game}
          screen={screen}
        />
      )}
    </div>
  );
}