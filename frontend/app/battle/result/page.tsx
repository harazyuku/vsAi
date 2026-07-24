"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import JudgeScreen from "../components/pc/JudgeScreen";
import MobileJudgeScreen from "../components/mobile/MobileJudgeScreen";
import {
  loadBattleResultSession,
  type BattleResultSession,
} from "@/lib/battleResultSession";

export default function BattleResultPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const result: BattleResultSession | null = isClient
    ? loadBattleResultSession()
    : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1100);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isClient || isMobile === null) {
    return <main className="min-h-screen bg-black" />;
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="mb-6 text-xl font-bold">判定結果が見つかりませんでした。</p>
          <Link
            href="/"
            className="inline-flex rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200"
          >
            タイトルへ戻る
          </Link>
        </div>
      </main>
    );
  }

  const isUserWinner = result.judgeResult.winner === "あなた";
  const plaintiffWon =
    (result.stance === "原告" && isUserWinner) ||
    (result.aiStance === "原告" && !isUserWinner);
  const winningStance = isUserWinner ? result.stance : result.aiStance;
  const verdictBackground =
    result.topicBackground === "court"
      ? plaintiffWon
        ? "/back-images/syouso.PNG"
        : "/back-images/haiso.PNG"
      : result.topicBackground === "deathgame"
        ? winningStance === "生贄賛成"
          ? "/back-images/ikenie-yes.jpg"
          : "/back-images/ikenie-no.PNG"
      : null;

  const judgeProps = {
    judgeResult: result.judgeResult,
    stance: result.stance,
    aiStance: result.aiStance,
    isCourt: result.topicBackground === "court",
    resultBackground: verdictBackground ?? undefined,
  };

  return (
    <main className="relative min-h-screen bg-black text-white">
      {verdictBackground && (
        <Image
          src={verdictBackground}
          alt=""
          fill
          priority
          sizes="100vw"
          className="fixed object-cover"
        />
      )}
      <div className="fixed inset-0 bg-black/50" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-0 md:p-4">
        {isMobile ? (
          <MobileJudgeScreen {...judgeProps} />
        ) : (
          <JudgeScreen {...judgeProps} />
        )}
      </div>
    </main>
  );
}
