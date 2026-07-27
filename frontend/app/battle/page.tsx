"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";
import SoloTeamScreen from "./components/solo/pc/TeamScreen";
import SoloMobileTeamScreen from "./components/solo/mobile/TeamScreen";
import SoloBattleScreen from "./components/solo/pc/BattleScreen";
import SoloMobileBattleScreen from "./components/solo/mobile/BattleScreen";
import TeamTeamScreen from "./components/team/pc/TeamScreen";
import TeamMobileTeamScreen from "./components/team/mobile/TeamScreen";
import TeamBattleScreen from "./components/team/pc/BattleScreen";
import TeamMobileBattleScreen from "./components/team/mobile/BattleScreen";
import RoundScreen from "./components/pc/RoundScreen";
import MobileRoundScreen from "./components/mobile/MobileRoundScreen";
import JudgeScreen, {
  type JudgeResult,
} from "./components/pc/JudgeScreen";
import MobileJudgeScreen from "./components/mobile/MobileJudgeScreen";
import CourtBackground from "./components/Background/CourtBackground";
import DeathGameBackground from "./components/Background/DeathGameBackground";
import SchoolBackground from "./components/Background/SchoolBackground";
import { loadBattleSession } from "@/lib/battleSession";
import { saveBattleResultSession } from "@/lib/battleResultSession";
import { useSocket } from "@/app/providers/SocketProvider";
import { isMultiplayerPlay } from "@/lib/playModeSession";

type MultiplayerSession = {
  roomId: string;
  userId: string;
  userName: string;
  isLeader: boolean;
  leaderUserName: string;
  totalPlayers: number;
};

type SharedTeamMessage = {
  userId: string;
  name: string;
  content: string;
  createdAt: number;
};

type SharedBattleMessage = SharedTeamMessage & {
  kind: "player" | "ai";
};

type SharedBattleAnimation = SharedBattleMessage & {
  isOwn: boolean;
};

type BattleReadyStatus = {
  readyCount: number;
  totalPlayers: number;
  readyUserIds: string[];
};

export default function Page() {
  const game = useGameLogic();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const hasStartedJudgeRef = useRef(false);

  const [screen, setScreen] = useState<"team" | "battle" | "judge">("team");
  const [showRoundScreen, setShowRoundScreen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [multiplayerSession] = useState<MultiplayerSession | null>(() => {
      if (typeof window === "undefined") return null;
      if (!isMultiplayerPlay()) return null;

      const roomId = window.sessionStorage.getItem("vsAi_activeRoom");
      const storedPlayer = window.sessionStorage.getItem("vsAi_matchPlayer");
      if (!roomId || !storedPlayer) return null;

      try {
        const player = JSON.parse(storedPlayer) as {
          userId: string;
          userName: string;
        };
        const storedSelection =
          window.sessionStorage.getItem("vsAi_sharedGame");
        const selection = storedSelection
          ? (JSON.parse(storedSelection) as {
              leaderUserId?: string;
              leaderUserName?: string;
              teamSize?: number;
            })
          : null;
        return {
          roomId,
          ...player,
          isLeader:
            !selection?.leaderUserId ||
            selection.leaderUserId === player.userId,
          leaderUserName: selection?.leaderUserName ?? player.userName,
          totalPlayers: selection?.teamSize ?? 1,
        };
      } catch {
        return null;
      }
  });
  const [isBattleReady, setIsBattleReady] = useState(false);
  const [battleReadyStatus, setBattleReadyStatus] =
    useState<BattleReadyStatus | null>(null);
  const [sharedBattleAnimation, setSharedBattleAnimation] =
    useState<SharedBattleAnimation | null>(null);
  const [sharedBattleDraft, setSharedBattleDraft] = useState("");
  const [isNextRoundReady, setIsNextRoundReady] = useState(false);
  const [nextRoundReadyStatus, setNextRoundReadyStatus] =
    useState<BattleReadyStatus | null>(null);

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
    nextRound,
    judge,
    receiveTeamMessage,
    receiveBattleMessage,
  } = game;

  useEffect(() => {
    if (!socket || !isConnected || !multiplayerSession) return;

    const handleTeamMessage = (message: SharedTeamMessage) => {
      receiveTeamMessage(
        message.content,
        message.userId === multiplayerSession.userId ? "あなた" : message.name,
        message.createdAt,
      );
    };
    const handleBattleMessage = (message: SharedBattleMessage) => {
      const role = message.kind === "ai" ? "敵AI" : message.name;

      if (message.kind === "player") setSharedBattleDraft("");
      receiveBattleMessage(message.content, role, message.createdAt);
      setSharedBattleAnimation({
        ...message,
        isOwn: message.userId === multiplayerSession.userId,
      });
    };
    const handleBattleDraft = ({
      userId,
      content,
    }: {
      userId: string;
      content: string;
    }) => {
      if (userId !== multiplayerSession.userId) {
        setSharedBattleDraft(content);
      }
    };
    const handleBattleReadyStatus = (status: BattleReadyStatus) => {
      setBattleReadyStatus(status);
      setIsBattleReady(status.readyUserIds.includes(multiplayerSession.userId));
    };
    const handleBattlePhaseStart = () => {
      setIsBattleReady(false);
      setBattleReadyStatus(null);
      setScreen("battle");
    };
    const handleNextRoundReadyStatus = (status: BattleReadyStatus) => {
      setNextRoundReadyStatus(status);
      setIsNextRoundReady(
        status.readyUserIds.includes(multiplayerSession.userId),
      );
    };
    const handleNextRoundStart = () => {
      setIsNextRoundReady(false);
      setNextRoundReadyStatus(null);
      setSharedBattleAnimation(null);
      setSharedBattleDraft("");
      nextRound();
      setScreen("team");
    };

    socket.on("team-message", handleTeamMessage);
    socket.on("battle-message", handleBattleMessage);
    socket.on("battle-draft", handleBattleDraft);
    socket.on("battle-ready-status", handleBattleReadyStatus);
    socket.on("battle-phase-start", handleBattlePhaseStart);
    socket.on("next-round-ready-status", handleNextRoundReadyStatus);
    socket.on("next-round-start", handleNextRoundStart);
    socket.emit("join-game-room", {
      roomId: multiplayerSession.roomId,
      userId: multiplayerSession.userId,
    });

    return () => {
      socket.off("team-message", handleTeamMessage);
      socket.off("battle-message", handleBattleMessage);
      socket.off("battle-draft", handleBattleDraft);
      socket.off("battle-ready-status", handleBattleReadyStatus);
      socket.off("battle-phase-start", handleBattlePhaseStart);
      socket.off("next-round-ready-status", handleNextRoundReadyStatus);
      socket.off("next-round-start", handleNextRoundStart);
    };
  }, [
    isConnected,
    multiplayerSession,
    receiveBattleMessage,
    receiveTeamMessage,
    nextRound,
    socket,
  ]);

  const sendSharedTeamMessage = (content: string) => {
    if (!socket || !multiplayerSession || !content.trim()) return;

    socket.emit("team-message", {
      roomId: multiplayerSession.roomId,
      userId: multiplayerSession.userId,
      content,
    });
  };

  const sendSharedBattleMessage = (
    content: string,
    kind: "player" | "ai",
  ) => {
    if (!socket || !multiplayerSession || !content.trim()) return;

    socket.emit("battle-message", {
      roomId: multiplayerSession.roomId,
      userId: multiplayerSession.userId,
      content,
      kind,
    });
  };

  const sendSharedBattleDraft = (content: string) => {
    if (!socket || !multiplayerSession || !multiplayerSession.isLeader) return;

    socket.emit("battle-draft", {
      roomId: multiplayerSession.roomId,
      userId: multiplayerSession.userId,
      content,
    });
  };

  const markBattleReady = () => {
    if (!socket || !multiplayerSession || isBattleReady) return;

    setIsBattleReady(true);
    socket.emit("battle-ready", {
      roomId: multiplayerSession.roomId,
      userId: multiplayerSession.userId,
    });
  };

  const markNextRoundReady = () => {
    if (!socket || !multiplayerSession || isNextRoundReady) return;

    setIsNextRoundReady(true);
    socket.emit("next-round-ready", {
      roomId: multiplayerSession.roomId,
      userId: multiplayerSession.userId,
    });
  };


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1100);
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

  useEffect(() => {
    if (
      !socket ||
      !multiplayerSession ||
      !game.selectedTopic
    ) return;

    const handleSharedJudgeResult = (result: JudgeResult) => {
      saveBattleResultSession({
        judgeResult: result,
        stance: game.stance,
        aiStance: game.aiStance,
        topicBackground: game.selectedTopic!.background,
      });
      router.replace("/battle/result");
    };

    socket.on("judge-result", handleSharedJudgeResult);
    return () => {
      socket.off("judge-result", handleSharedJudgeResult);
    };
  }, [
    game.aiStance,
    game.selectedTopic,
    game.stance,
    multiplayerSession,
    router,
    socket,
  ]);


  // ラウンド監視
  useEffect(() => {
    if (
      round !== 4 ||
      hasStartedJudgeRef.current ||
      !game.selectedTopic
    ) return;

    hasStartedJudgeRef.current = true;
    setScreen("judge");

    const finishBattle = async () => {
      try {
        if (multiplayerSession && !multiplayerSession.isLeader) return;

        const result = await judge();

        if (multiplayerSession && socket) {
          socket.emit("judge-result", {
            roomId: multiplayerSession.roomId,
            userId: multiplayerSession.userId,
            result,
          });
          return;
        }

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
    multiplayerSession,
    socket,
  ]);


  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black text-white">


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

      <div className="absolute inset-0 z-10 flex items-center justify-center overflow-auto p-0 sm:p-4">


        {isMobile !== null && screen === "team" && (

          isMobile ? (
            multiplayerSession ? (
              <TeamMobileTeamScreen
                {...game}
                sendSharedTeamMessage={sendSharedTeamMessage}
                teamRoleLabel={
                  multiplayerSession.isLeader
                    ? "チームリーダー"
                    : "サポーター"
                }
                onBattlePhaseRequest={markBattleReady}
                isBattleReady={isBattleReady}
                battleReadyLabel={
                  `準備完了 (${battleReadyStatus?.readyCount ?? 0}/${battleReadyStatus?.totalPlayers ?? multiplayerSession.totalPlayers})`
                }
                onChangeScreen={() => setScreen("battle")}
                setShowRoundScreen={setShowRoundScreen}
              />
            ) : (
              <SoloMobileTeamScreen
                {...game}
                onChangeScreen={() => setScreen("battle")}
                setShowRoundScreen={setShowRoundScreen}
              />
            )

          ) : (

            <div className="origin-center scale-[0.88] xl:scale-[0.92] 2xl:scale-100">
              {multiplayerSession ? (
                <TeamTeamScreen
                  {...game}
                  sendSharedTeamMessage={sendSharedTeamMessage}
                  teamRoleLabel={
                    multiplayerSession.isLeader
                      ? "チームリーダー"
                      : "サポーター"
                  }
                  onBattlePhaseRequest={markBattleReady}
                  isBattleReady={isBattleReady}
                  battleReadyLabel={
                    `準備完了 (${battleReadyStatus?.readyCount ?? 0}/${battleReadyStatus?.totalPlayers ?? multiplayerSession.totalPlayers})`
                  }
                  onChangeScreen={() => setScreen("battle")}
                  setShowRoundScreen={setShowRoundScreen}
                />
              ) : (
                <SoloTeamScreen
                  {...game}
                  onChangeScreen={() => setScreen("battle")}
                  setShowRoundScreen={setShowRoundScreen}
                />
              )}

            </div>

          )

        )}



        {isMobile !== null && screen === "battle" && (

          isMobile ? (
            multiplayerSession ? (
              <TeamMobileBattleScreen
                {...game}
                sendSharedBattleMessage={sendSharedBattleMessage}
                sendSharedBattleDraft={sendSharedBattleDraft}
                sharedBattleDraft={sharedBattleDraft}
                canSubmit={multiplayerSession.isLeader}
                playerDisplayName={multiplayerSession.leaderUserName}
                teamRoleLabel={
                  multiplayerSession.isLeader
                    ? "チームリーダー"
                    : "サポーター"
                }
                sharedBattleEvent={sharedBattleAnimation}
                onNextRoundRequest={markNextRoundReady}
                isNextRoundReady={isNextRoundReady}
                nextRoundReadyLabel={
                  `次のラウンドへ (${nextRoundReadyStatus?.readyCount ?? 0}/${nextRoundReadyStatus?.totalPlayers ?? multiplayerSession.totalPlayers})`
                }
                onChangeScreen={() => setScreen("team")}
                setShowRoundScreen={setShowRoundScreen}
              />
            ) : (
              <SoloMobileBattleScreen
                {...game}
                onChangeScreen={() => setScreen("team")}
                setShowRoundScreen={setShowRoundScreen}
              />
            )

          ) : (

            <div className="origin-center scale-[0.88] xl:scale-[0.92] 2xl:scale-100">
              {multiplayerSession ? (
                <TeamBattleScreen
                  {...game}
                  sendSharedBattleMessage={sendSharedBattleMessage}
                  sendSharedBattleDraft={sendSharedBattleDraft}
                  sharedBattleDraft={sharedBattleDraft}
                  canSubmit={multiplayerSession.isLeader}
                  playerDisplayName={multiplayerSession.leaderUserName}
                  teamRoleLabel={
                    multiplayerSession.isLeader
                      ? "チームリーダー"
                      : "サポーター"
                  }
                  sharedBattleEvent={sharedBattleAnimation}
                  onNextRoundRequest={markNextRoundReady}
                  isNextRoundReady={isNextRoundReady}
                  nextRoundReadyLabel={
                    `次のラウンドへ (${nextRoundReadyStatus?.readyCount ?? 0}/${nextRoundReadyStatus?.totalPlayers ?? multiplayerSession.totalPlayers})`
                  }
                  onChangeScreen={() => setScreen("team")}
                  setShowRoundScreen={setShowRoundScreen}
                />
              ) : (
                <SoloBattleScreen
                  {...game}
                  onChangeScreen={() => setScreen("team")}
                  setShowRoundScreen={setShowRoundScreen}
                />
              )}

            </div>

          )

        )}



        {isMobile !== null && screen === "judge" && (

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



      {isMobile !== null && showRoundScreen && screen !== "judge" && (

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
