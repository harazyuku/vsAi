"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StoryScreen from "../components/pc/StoryScreen";
import MobileStoryScreen from "../components/mobile/MobileStoryScreen";
import IntroScreen from "../components/pc/IntroScreen";
import TeamIntroScreen from "../components/team/TeamIntroScreen";
import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";
import { saveBattleSession } from "@/lib/battleSession";
import { aiCharacters, topics } from "@/app/config/aiConfig";
import { useSocket } from "@/app/providers/SocketProvider";
import { useGLTF } from "@react-three/drei";
import { isMultiplayerPlay } from "@/lib/playModeSession";

type StoryFinishedNotice = {
  userId: string;
  userName: string;
  finishedCount: number;
  totalPlayers: number;
};

function getStoredTeamRole(): "leader" | "supporter" | null {
  if (!isMultiplayerPlay()) return null;

  const roomId = window.sessionStorage.getItem("vsAi_activeRoom");
  const storedPlayer = window.sessionStorage.getItem("vsAi_matchPlayer");
  const storedSelection = window.sessionStorage.getItem("vsAi_sharedGame");
  if (!roomId || !storedPlayer || !storedSelection) return null;

  try {
    const { userId } = JSON.parse(storedPlayer) as { userId: string };
    const { leaderUserId } = JSON.parse(storedSelection) as {
      leaderUserId?: string;
    };
    if (!leaderUserId) return null;
    return userId === leaderUserId ? "leader" : "supporter";
  } catch {
    return null;
  }
}

export default function StoryPage() {
  const router = useRouter();
  const { socket } = useSocket();
  const game = useGameLogic();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [notices, setNotices] = useState<StoryFinishedNotice[]>([]);
  const [exitingNoticeIds, setExitingNoticeIds] = useState<Set<string>>(
    new Set(),
  );
  const [isWaitingForMembers, setIsWaitingForMembers] = useState(false);
  const [teamRole] = useState<"leader" | "supporter" | null>(
    getStoredTeamRole,
  );
  const hasInitialized = useRef(false);
  const hasReportedFinished = useRef(false);

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

    const storedSelection = window.sessionStorage.getItem("vsAi_sharedGame");
    let ai = selectAi();
    let topic = selectTopic();
    let userStance: string;

    if (storedSelection) {
      try {
        const sharedSelection = JSON.parse(storedSelection) as {
          aiId: string;
          topicBackground: "school" | "court" | "deathgame";
          stanceIndex: number;
          leaderUserId?: string;
        };
        ai = aiCharacters[sharedSelection.aiId] ?? ai;
        topic =
          topics.find(
            (candidate) =>
              candidate.background === sharedSelection.topicBackground,
          ) ?? topic;
        userStance =
          topic.stances[sharedSelection.stanceIndex] ?? selectStance(topic);

      } catch {
        userStance = selectStance(topic);
      }
    } else {
      userStance = selectStance(topic);
    }

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

  useEffect(() => {
    if (!selectedTopic) return;

    const modelPaths = {
      court: "/models/thai_court.glb",
      deathgame: "/models/vr_room.glb",
      school: "/models/japanese_classroom.glb",
    } as const;

    useGLTF.preload(modelPaths[selectedTopic.background]);
  }, [selectedTopic]);

  const finishIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    if (!socket || !teamRole) return;

    const handleStoryFinished = (notice: StoryFinishedNotice) => {
      const storedPlayer = window.sessionStorage.getItem("vsAi_matchPlayer");
      const myUserId = storedPlayer
        ? (JSON.parse(storedPlayer) as { userId: string }).userId
        : null;
      if (notice.userId === myUserId) return;

      setNotices((current) => [...current, notice]);
      window.setTimeout(() => {
        setExitingNoticeIds((current) => {
          const next = new Set(current);
          next.add(notice.userId);
          return next;
        });
      }, 3800);
      window.setTimeout(() => {
        setNotices((current) =>
          current.filter((item) => item.userId !== notice.userId),
        );
        setExitingNoticeIds((current) => {
          const next = new Set(current);
          next.delete(notice.userId);
          return next;
        });
      }, 4500);
    };

    const handleAllStoriesFinished = () => {
      router.replace("/battle");
    };

    socket.on("story-player-finished", handleStoryFinished);
    socket.on("all-stories-finished", handleAllStoriesFinished);
    return () => {
      socket.off("story-player-finished", handleStoryFinished);
      socket.off("all-stories-finished", handleAllStoriesFinished);
    };
  }, [router, socket, teamRole]);

  const startBattle = useCallback(() => {
    if (!selectedAI || !selectedTopic || hasReportedFinished.current) return;

    saveBattleSession({
      selectedAI,
      selectedTopic,
      stance,
      aiStance,
    });

    if (socket && teamRole) {
      const roomId = window.sessionStorage.getItem("vsAi_activeRoom");
      const storedPlayer = window.sessionStorage.getItem("vsAi_matchPlayer");

      if (roomId && storedPlayer) {
        const { userId } = JSON.parse(storedPlayer) as { userId: string };
        hasReportedFinished.current = true;
        setIsWaitingForMembers(true);
        socket.emit("story-finished", { roomId, userId });
        return;
      }
    }

    hasReportedFinished.current = true;
    router.replace("/battle");
  }, [aiStance, router, selectedAI, selectedTopic, socket, stance, teamRole]);

  return (
    <main className="h-[100dvh] overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed left-1/2 top-5 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-2">
        {notices.map((notice) => (
          <div
            key={notice.userId}
            className={`${exitingNoticeIds.has(notice.userId) ? "story-notice-out" : "story-scene-in"} rounded-2xl border border-cyan-300/25 bg-slate-950/90 px-5 py-4 text-center shadow-[0_15px_50px_rgba(0,0,0,.7)] backdrop-blur-xl`}
          >
            <p className="font-black text-cyan-100">
              「{notice.userName}」がstoryを見終わりました
            </p>
            <p className="mt-1 text-xs font-bold text-white/45">
              {notice.finishedCount} / {notice.totalPlayers} 人完了
            </p>
          </div>
        ))}
      </div>

      {isWaitingForMembers && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-cyan-300/25 bg-slate-950/90 px-7 py-9 text-center shadow-[0_20px_80px_rgba(0,0,0,.8)]">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-cyan-200/20 border-t-cyan-300" />
            <p className="text-xl font-black text-cyan-100">
              メンバーを待っています
            </p>
            <p className="mt-3 text-sm font-bold leading-relaxed text-white/55">
              全員がstoryを見終えると
              <br />
              バトル画面へ進みます
            </p>
          </div>
        </div>
      )}

      {showIntro && selectedAI && selectedTopic ? (
        teamRole ? (
          <TeamIntroScreen
            selectedAI={selectedAI}
            selectedTopic={selectedTopic}
            isLeader={teamRole === "leader"}
            onComplete={finishIntro}
          />
        ) : (
          <IntroScreen
            selectedAI={selectedAI}
            selectedTopic={selectedTopic}
            onComplete={finishIntro}
          />
        )
      ) : isMobile === null ? null : isMobile ? (
        <MobileStoryScreen {...game} onComplete={startBattle} />
      ) : (
        <StoryScreen {...game} onComplete={startBattle} />
      )}
    </main>
  );
}
