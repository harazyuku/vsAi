"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { AICharacter, Topic } from "@/app/config/aiConfig";
import {
  selectableSituations,
  shuffleSituations,
} from "@/app/battle/components/pc/IntroScreen";

type Props = {
  selectedAI: AICharacter;
  selectedTopic: Topic;
  isLeader: boolean;
  onComplete: () => void;
};

export default function TeamIntroScreen({
  selectedAI,
  selectedTopic,
  isLeader,
  onComplete,
}: Props) {
  const [situationIndex, setSituationIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(true);
  const [showOpponent, setShowOpponent] = useState(false);
  const [showRole, setShowRole] = useState(false);
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
    const opponentTimer = window.setTimeout(() => setShowOpponent(true), 2700);
    const roleTimer = window.setTimeout(() => setShowRole(true), 4000);
    const closeTimer = window.setTimeout(() => setIsClosing(true), 6500);
    const completeTimer = window.setTimeout(onComplete, 7300);

    return () => {
      window.clearInterval(shuffleTimer);
      window.clearTimeout(decideTimer);
      window.clearTimeout(opponentTimer);
      window.clearTimeout(roleTimer);
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
      <picture
        className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-out ${
          isShuffling ? "scale-105 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <source
          media="(max-width: 767px)"
          srcSet={selectedSituation.mobileImage}
        />
        <img
          src={selectedSituation.image}
          alt=""
          className={`h-full w-full object-cover object-center ${selectedSituation.mobileClass}`}
        />
      </picture>

      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,.82)_100%)]" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 py-7 text-center">
        <p className="text-xs font-black tracking-[0.35em] text-cyan-300 md:text-sm">
          TEAM BATTLE
        </p>
        <h1 className="mt-3 text-base font-black tracking-wider text-white/70 md:text-xl">
          シチュエーションを選択中・・・
        </h1>

        <div className="mt-5 min-h-16">
          <p
            className={`text-3xl font-black tracking-wider md:text-6xl ${
              isShuffling ? "opacity-70" : "zoom-slash text-cyan-100"
            }`}
          >
            {situationName}
          </p>
        </div>

        <div
          className={`mt-5 flex min-h-40 flex-col items-center transition-all duration-700 ease-out md:min-h-56 ${
            showOpponent
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-white/55">
            対戦相手
          </p>
          <Image
            src={selectedAI.icon}
            alt={selectedAI.name}
            width={160}
            height={160}
            className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-[0_0_40px_rgba(255,255,255,.35)] md:h-40 md:w-40"
          />
          <p className="mt-3 text-2xl font-black md:text-4xl">
            {selectedAI.name}
          </p>
        </div>

        <div
          className={`mt-3 w-full max-w-xl transition-all duration-700 ease-out ${
            showRole
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-5 scale-95 opacity-0"
          }`}
        >
          <p className="text-sm font-bold tracking-widest text-white/55">
            あなたの役割
          </p>
          <div
            className={`mt-2 rounded-2xl border px-5 py-4 backdrop-blur-xl ${
              isLeader
                ? "border-amber-300/50 bg-amber-400/15 shadow-[0_0_45px_rgba(251,191,36,.18)]"
                : "border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_45px_rgba(34,211,238,.15)]"
            }`}
          >
            <p className="text-xl font-black md:text-3xl">
              あなたは
              <span className={isLeader ? "text-amber-300" : "text-cyan-300"}>
                「{isLeader ? "チームリーダー" : "サポーター"}」
              </span>
              です
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
