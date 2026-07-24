"use client";

import { useEffect, useState } from "react";
import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";
import IntroScreen from "./components/pc/IntroScreen";
import MobileIntroScreen from "./components/mobile/MobileIntroScreen";
import TeamScreen from "./components/pc/TeamScreen";
import MobileTeamScreen from "./components/mobile/MobileTeamScreen";
import BattleScreen from "./components/pc/BattleScreen";
import MobileBattleScreen from "./components/mobile/MobileBattleScreen";
import RoundScreen from "./components/pc/RoundScreen";
import MobileRoundScreen from "./components/mobile/MobileRoundScreen";
import JudgeScreen from "./components/pc/JudgeScreen";
import MobileJudgeScreen from "./components/mobile/MobileJudgeScreen";
import CourtBackground from "./components/Background/CourtBackground";
import DeathGameBackground from "./components/Background/DeathGameBackground";
import SchoolBackground from "./components/Background/SchoolBackground";

export default function Page() {
  const game = useGameLogic();

  const [screen, setScreen] = useState<"intro" | "team" | "battle" | "judge">("intro");
  const [showIntro, setShowIntro] = useState(true);
  const [showRoundScreen, setShowRoundScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);


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


  const closeIntro = () => {
    setShowIntro(false);
  };


  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">


      {/* <div className="fixed inset-0 z-0">
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
      </div> */}


      {showIntro && (
        <div className="absolute inset-0 z-20 flex items-center justify-center overflow-auto">

          {isMobile ? (
            <MobileIntroScreen
              {...game}
              onChangeScreen={() => setScreen("team")}
              closeIntro={closeIntro}
            />
          ) : (
            <IntroScreen
              {...game}
              onChangeScreen={() => setScreen("team")}
              closeIntro={closeIntro}
            />
          )}

        </div>
      )}



      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 overflow-auto">


        {screen === "team" && (

          isMobile ? (

            <MobileTeamScreen
              {...game}
              onChangeScreen={() => setScreen("battle")}
              setShowRoundScreen={setShowRoundScreen}
            />

          ) : (

            <div className="origin-center scale-[0.8] 2xl:scale-100">

              <TeamScreen
                {...game}
                onChangeScreen={() => setScreen("battle")}
                setShowRoundScreen={setShowRoundScreen}
              />

            </div>

          )

        )}



        {screen === "battle" && (

          isMobile ? (

            <MobileBattleScreen
              {...game}
              onChangeScreen={() => setScreen("team")}
              setShowRoundScreen={setShowRoundScreen}
            />

          ) : (

            <div className="origin-center scale-[0.8] 2xl:scale-100">

              <BattleScreen
                {...game}
                onChangeScreen={() => setScreen("team")}
                setShowRoundScreen={setShowRoundScreen}
              />

            </div>

          )

        )}



        {screen === "judge" && (

          isMobile ? (

            <MobileJudgeScreen
              judgeResult={game.judgeResult}
            />

          ) : (

            <JudgeScreen
              judgeResult={game.judgeResult}
            />

          )

        )}


      </div>



      {showRoundScreen && screen !== "intro" && screen !== "judge" && (

        isMobile ? (

          <MobileRoundScreen
            {...game}
            screen={screen}
          />

        ) : (

          <RoundScreen
            {...game}
            screen={screen}
          />

        )
      )}


    </div>
  );
}
