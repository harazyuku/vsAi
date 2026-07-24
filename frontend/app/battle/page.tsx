"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";
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
import { loadBattleSession } from "@/lib/battleSession";
import { saveBattleResultSession } from "@/lib/battleResultSession";

export default function Page() {
  const game = useGameLogic();
  const router = useRouter();
  const hasStartedJudgeRef = useRef(false);

  const [screen, setScreen] = useState<"team" | "battle" | "judge">("team");
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
    const savedSession = loadBattleSession();

    if (savedSession) {
      setSelectedAI(savedSession.selectedAI);
      setSelectedTopic(savedSession.selectedTopic);
      setStance(savedSession.stance);
      setAiStance(savedSession.aiStance);
      return;
    }

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
    if (
      round !== 6 ||
      hasStartedJudgeRef.current ||
      !game.selectedTopic
    ) return;

    hasStartedJudgeRef.current = true;
    setScreen("judge");

    const finishBattle = async () => {
      try {
        const result = await judge();

        saveBattleResultSession({
          judgeResult: result,
          stance: game.stance,
          aiStance: game.aiStance,
          topicBackground: game.selectedTopic!.background,
        });

        router.replace("/battle/result");
      } catch (error) {
        console.error("ジャッジに失敗しました:", error);
        hasStartedJudgeRef.current = false;
      }
    };

    void finishBattle();
  }, [
    round,
    judge,
    router,
    game.stance,
    game.aiStance,
    game.selectedTopic,
  ]);


  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">


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

      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/50" />

      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 overflow-auto">


        {screen === "team" && (

          isMobile ? (

            <MobileTeamScreen
              {...game}
              onChangeScreen={() => setScreen("battle")}
              setShowRoundScreen={setShowRoundScreen}
            />

          ) : (

            <div className="origin-center scale-[0.9] 2xl:scale-100">

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

            <div className="origin-center scale-[0.9] 2xl:scale-100">

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
              stance={game.stance}
              aiStance={game.aiStance}
              isCourt={game.selectedTopic?.background === "court"}
            />

          ) : (

            <JudgeScreen
              judgeResult={game.judgeResult}
              stance={game.stance}
              aiStance={game.aiStance}
              isCourt={game.selectedTopic?.background === "court"}
            />

          )

        )}


      </div>



      {showRoundScreen && screen !== "judge" && (

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
