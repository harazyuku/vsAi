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
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black px-6">
        <div className="animate-round-in text-center">
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-black tracking-wider leading-none">
            ROUND {round}
          </h1>

          <p className="mt-4 md:mt-6 text-[clamp(1rem,3vw,2rem)] font-semibold text-white/70 leading-relaxed">
            {screen === "team"
              ? "作戦会議"
              : "そのボキャブラリーで相手を泣かせてやれ"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoundScreen;