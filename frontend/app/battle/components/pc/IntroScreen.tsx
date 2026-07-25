"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { AICharacter, Topic } from "@/app/config/aiConfig";

type Props = {
  selectedAI: AICharacter;
  selectedTopic: Topic;
  onComplete: () => void;
};

const shuffleSituations = [
  "学級裁判",
  "国会議事堂",
  "宇宙ステーション",
  "無人島",
  "法廷",
  "深夜のファミレス",
  "魔王城",
  "生徒会室",
  "地下シェルター",
  "記者会見場",
  "デスゲーム会場",
  "満員電車",
  "廃校",
  "選挙演説会場",
  "異世界コロシアム",
];

const selectableSituations: Record<
  Topic["background"],
  { name: string; image: string }
> = {
  school: {
    name: "学級裁判",
    image: "/images/situations/school.png",
  },
  court: {
    name: "法廷",
    image: "/images/situations/saibansyo.png",
  },
  deathgame: {
    name: "デスゲーム会場",
    image: "/images/situations/deathgame.png",
  },
};

export default function IntroScreen({
  selectedAI,
  selectedTopic,
  onComplete,
}: Props) {
  const [situationIndex, setSituationIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(true);
  const [showOpponent, setShowOpponent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let index = 0;
    const shuffleTimer = window.setInterval(() => {
      index = (index + 1) % shuffleSituations.length;
      setSituationIndex(index);
    }, 55);

    const decideTimer = window.setTimeout(() => {
      window.clearInterval(shuffleTimer);
      setIsShuffling(false);
    }, 1900);

    const opponentTimer = window.setTimeout(() => {
      setShowOpponent(true);
    }, 2700);

    const closeTimer = window.setTimeout(() => {
      setIsClosing(true);
    }, 5200);

    const completeTimer = window.setTimeout(onComplete, 6000);

    return () => {
      window.clearInterval(shuffleTimer);
      window.clearTimeout(decideTimer);
      window.clearTimeout(opponentTimer);
      window.clearTimeout(closeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const selectedSituation = selectableSituations[selectedTopic.background];
  const situationName = isShuffling
    ? shuffleSituations[situationIndex]
    : selectedSituation.name;

  return (
    <div
      className={`relative min-h-[100dvh] w-full overflow-hidden bg-black text-white ${
        isClosing ? "fade-out" : ""
      }`}
    >
      <Image
        src={selectedSituation.image}
        alt=""
        fill
        priority
        sizes="100vw"
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out ${
          isShuffling
            ? "scale-105 opacity-0"
            : "scale-100 opacity-100"
        }`}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,.78)_100%)]" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10 text-center">
        <p className="text-sm font-black tracking-[0.35em] text-red-300 md:text-base">
          SITUATION SELECT
        </p>
        <h1 className="mt-4 text-lg font-black tracking-wider text-white/75 md:text-2xl">
          シチュエーションを選択中・・・
        </h1>

        <div className="mt-7 min-h-20">
          <p
            className={`text-4xl font-black tracking-wider md:text-7xl ${
              isShuffling ? "opacity-70" : "zoom-slash text-red-100"
            }`}
          >
            {situationName}
          </p>
          {!isShuffling && (
            <div className="mx-auto mt-4 h-1 w-28 bg-red-500 shadow-[0_0_24px_rgba(239,68,68,.9)]" />
          )}
        </div>

        <div
          className={`mt-10 flex min-h-52 flex-col items-center transition-all duration-700 ease-out md:min-h-72 ${
            showOpponent
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <p className="mb-4 text-sm font-bold tracking-[0.25em] text-white/60">
            対戦相手
          </p>
          <Image
            src={selectedAI.icon}
            alt={selectedAI.name}
            width={208}
            height={208}
            className="h-36 w-36 rounded-full border-4 border-white object-cover shadow-[0_0_45px_rgba(255,255,255,.4)] md:h-52 md:w-52"
          />
          <p className="mt-4 text-3xl font-black md:text-5xl">
            {selectedAI.name}
          </p>
        </div>
      </div>
    </div>
  );
}
