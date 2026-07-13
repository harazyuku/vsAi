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
    <div className={`absolute inset-0 z-15 ${isClosing ? "quick-fade-out" : ""}`}>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
        <div className="animate-round-in text-center">
          <h1 className="text-8xl font-black">
            ROUND {round}
          </h1>

          <p className="mt-6 text-4xl font-bold text-white/70">
            {screen === "team" ? "作戦会議" : "そのボキャブラリーで相手を泣かせてやれ"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoundScreen;