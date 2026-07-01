"use client";

import { useState, useEffect } from "react";

interface PhaseTransitionScreenProps {
  screen: "team" | "battle" | "judge";
  round: number;
  onClose: () => void;
}

export default function PhaseTransitionScreen({ screen, round, onClose }: PhaseTransitionScreenProps) {
  // マウント時の現在の画面から「次のフェーズ」の表示を確定させてロックする
  const [displayScreen] = useState<"team" | "battle">(screen === "team" ? "battle" : "team");
  const [displayRound] = useState<number>(screen === "battle" ? round + 1 : round);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 2秒表示後にフェードアウト開始
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    // フェードアウト完了(500ms)後に画面を閉じる
    const hideTimer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${isFading ? "opacity-0" : "opacity-100"}`}>
      <div className="text-5xl font-bold animate-pulse">
        {displayScreen === "team" ? "TEAM PHASE" : "BATTLE PHASE"}
      </div>
      <div className="text-xl text-white/60 mt-4">
        第 {displayRound} ラウンド
      </div>
    </div>
  );
}
