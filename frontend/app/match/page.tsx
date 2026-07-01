"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeGame } from "../../hooks/useRealtimeGame";

export default function MatchPage() {
  const router = useRouter();
  const [userId] = useState(() => {
  let id = localStorage.getItem("vsAi_userId");

  if (!id) {
    id = `user-${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem("vsAi_userId", id);
  }

  return id;
});
  const [userName] = useState(() => `プレイヤー-${Math.floor(Math.random() * 1000)}`);
  const { matchingStatus, startMatching, cancelMatching } = useRealtimeGame();

  const handleMatchToggle = () => {
    if (matchingStatus === "searching") {
      cancelMatching(userId);
    } else {
      startMatching(userId, userName);
    }
  };

  const goSolo = () => {
    router.push("/battle");
  };

  const getStatusText = () => {
    switch (matchingStatus) {
      case "searching":
        return "対戦相手を探しています...";
      case "matched":
        return "マッチング完了！";
      case "idle":
      default:
        return "マッチングを開始する";
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
      <div
        className="relative w-full max-w-md text-center cursor-pointer"
        onClick={handleMatchToggle}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 blur-2xl" />

        <div className="relative z-10">
          <div className="text-3xl tracking-widest opacity-90">
            {getStatusText()}
          </div>

          {matchingStatus === "searching" && (
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse [animation-delay:150ms]" />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse [animation-delay:300ms]" />
            </div>
          )}

          <div className="mt-10 text-sm text-white/40">
            {matchingStatus === "searching" ? "タップでキャンセル" : "画面をタップして対戦スタート"}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goSolo();
            }}
            className="mt-6 text-white/70 hover:text-white underline text-sm"
          >
            一人で挑戦する
          </button>
        </div>
      </div>
    </div>
  );
}
