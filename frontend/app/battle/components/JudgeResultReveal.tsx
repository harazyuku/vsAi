"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  winnerLabel: string;
  verdictText: string;
  winnerSide: "player" | "enemy";
  backgroundImage?: string;
  onComplete: () => void;
};

export default function JudgeResultReveal({
  winnerLabel,
  verdictText,
  winnerSide,
  backgroundImage,
  onComplete,
}: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setIsClosing(true), 2800);
    const completeTimer = window.setTimeout(() => onCompleteRef.current(), 3300);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(completeTimer);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={`judge-reveal fixed inset-0 z-[120] overflow-hidden bg-black text-white ${
      isClosing ? "judge-reveal-out" : ""
    }`}>
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          className="judge-reveal-background absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/45" />
      <div className={`absolute inset-0 ${
        winnerSide === "player"
          ? "bg-[radial-gradient(circle,rgba(37,99,235,0.32),transparent_55%)]"
          : "bg-[radial-gradient(circle,rgba(220,38,38,0.25),transparent_55%)]"
      }`} />

      <div className={`judge-reveal-line absolute left-[-10%] top-1/2 h-2 w-[120%] -rotate-3 ${
        winnerSide === "player" ? "bg-blue-300" : "bg-red-400"
      }`} />

      <div className="judge-reveal-content relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-black tracking-[0.6em] text-white/60 md:text-xl">
          FINAL JUDGMENT
        </p>
        <p className={`text-6xl font-black tracking-[0.12em] drop-shadow-2xl md:text-9xl ${
          winnerSide === "player" ? "text-blue-300" : "text-red-400"
        }`}>
          {verdictText}
        </p>
        <div className="mt-8 border-y border-white/30 bg-black/45 px-10 py-4">
          <p className="text-2xl font-black md:text-5xl">{winnerLabel}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
