import React, { useEffect, useState } from "react";
import { useGameLogic } from "@/hooks/useGameLogic/useGameLogic";

type Props = ReturnType<typeof useGameLogic> & {
  screen: "team" | "battle" | "judge";
};

function RoundScreen({
  round,
  wait,
  screen,
}: Props) {

  const [isClosing, setIsClosing] = useState(false);

  const RoundScreenFlow = async () => {
    await wait(1800);
    setIsClosing(true);
  }

  useEffect(() => {

    RoundScreenFlow();
    return () => {

    };
  }, []);

  return (
    <div className={`absolute inset-0 z-15 ${isClosing ? "round-screen-out" : "round-screen-in"}`}>
      <div className="round-cinematic absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-black px-6">
        <div className="round-grid absolute inset-0" />
        <div className="round-flash absolute inset-0" />

        <div className="round-line round-line-left absolute left-0 top-1/2 h-1 w-1/2 bg-blue-500" />
        <div className="round-line round-line-right absolute right-0 top-1/2 h-1 w-1/2 bg-red-500" />

        <div className="round-title relative w-full text-center">
          <p className="round-label text-sm font-black tracking-[0.6em] text-white/60">
            ROUND
          </p>
          <h1 className="round-number mt-2 text-[7rem] font-black italic leading-none tracking-tighter text-white">
            {round}
          </h1>

          <div className="round-subtitle mx-auto mt-6 max-w-sm border-y border-white/20 px-3 py-4">
            <p className="text-lg font-bold leading-relaxed tracking-wider text-white/80">
              {screen === "team"
                ? "作戦会議"
                : "そのボキャブラリーで相手を泣かせてやれ"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoundScreen;
