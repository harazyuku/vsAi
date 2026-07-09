"use client";
import { useEffect, useState } from "react";
import { useGameLogic } from '@/hooks/useGameLogic/useGameLogic';
import IntroScreen from "./components/IntroScreen";
import TeamScreen from "./components/TeamScreen";
import BattleScreen from "./components/BattleScreen";
import JudgeScreen from "./components/JudgeScreen";
import CourtBackground from "./components/Background/CourtBackground";
import DeathGameBackground from "./components/Background/DeathGameBackground";
import SchoolBackground from "./components/Background/SchoolBackground";

export default function Page() {
  const game = useGameLogic();

  const [screen, setScreen] = useState<"intro" | "team" | "battle">("intro");
  const [showIntro, setShowIntro] = useState(true);

  // introScreenを消す
  const closeIntro = () => {
    setShowIntro(false);
  };

  useEffect(() => {
    console.log("selectedTopic changed", game.selectedTopic);
  }, [game.selectedTopic]);

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


      {/* 対戦相手選択 */}
      {showIntro && (
        <div className="z-20 flex items-center justify-center absolute inset-0">
          <IntroScreen
            {...game}
            onChangeScreen={() => setScreen("team")}
            closeIntro={closeIntro} />
        </div>
      )}
      {/* <PhaseTransitionScreen /> */}




      <div className="z-10 absolute inset-0 flex items-center justify-center">
        {screen === "team" && (
          <TeamScreen
            {...game}
            onChangeScreen={() => setScreen("battle")} />
        )}
      </div>

      {screen === "battle" && (
        <BattleScreen
          {...game}
          onChangeScreen={() => setScreen("team")} />
      )}

    </div>
  );
}
