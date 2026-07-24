"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  message: string;
  onComplete: () => void;
};

export default function BattleAttackScreen({
  message,
  onComplete,
}: Props) {
  const onCompleteRef = useRef(onComplete);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setIsClosing(true), 2800);
    const completeTimer = window.setTimeout(() => onCompleteRef.current(), 3200);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(completeTimer);
    };
  }, []);

  if (typeof document === "undefined") return null;

  const messageSizeClass =
    message.length <= 20
      ? "text-4xl md:text-7xl"
      : message.length <= 50
        ? "text-3xl md:text-5xl"
        : "text-2xl md:text-4xl";

  return createPortal(
    <div className={`battle-attack-screen fixed inset-0 z-[70] overflow-hidden bg-[#020817] text-white ${
      isClosing ? "battle-attack-out" : ""
    }`}>
      <div className="battle-attack-flash absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(37,99,235,0.5),transparent_45%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(115deg,transparent_35%,rgba(96,165,250,.5)_36%,transparent_37%)] [background-size:90px_90px]" />

      <div className="battle-attack-slash absolute left-[-20%] top-[46%] h-3 w-[140%] -rotate-6 bg-cyan-300 shadow-[0_0_35px_12px_rgba(34,211,238,0.8)]" />
      <div className="battle-attack-slash-secondary absolute left-[-20%] top-[56%] h-1.5 w-[140%] rotate-3 bg-blue-400 shadow-[0_0_25px_8px_rgba(59,130,246,0.7)]" />

      <div className="battle-attack-player absolute inset-y-0 left-[-3%] z-10 flex w-[46%] items-center justify-center">
        <div className="absolute h-[55vw] w-[55vw] rounded-full border border-blue-300/20 bg-blue-500/15 shadow-[0_0_80px_rgba(37,99,235,0.5)]" />
        <img
          src="/images/chara-icons/player.PNG"
          alt="あなた"
          className="relative max-h-[68vh] max-w-[85%] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.8)]"
        />
      </div>

      <div className="battle-attack-message absolute inset-y-0 right-[4%] z-20 flex w-[58%] items-center justify-center">
        <div className="relative w-full -skew-x-6 border-y-2 border-cyan-300/70 bg-blue-950/80 px-7 py-9 shadow-[0_0_45px_rgba(37,99,235,0.5)] md:px-12 md:py-12">
          <p className="mb-3 text-xs font-black tracking-[0.4em] text-cyan-300/70">YOUR ARGUMENT</p>
          <p className={`skew-x-6 break-words font-black italic leading-tight drop-shadow-lg ${messageSizeClass}`}>
            「{message}」
          </p>
        </div>
      </div>

      <div className="battle-attack-impact pointer-events-none absolute left-[42%] top-1/2 z-30 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white" />
    </div>,
    document.body,
  );
}
