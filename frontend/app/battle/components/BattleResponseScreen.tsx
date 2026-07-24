"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  aiName: string;
  aiIcon: string;
  message: string;
  onReveal: () => void;
  onConfirm: () => void;
};

export default function BattleResponseScreen({
  aiName,
  aiIcon,
  message,
  onReveal,
  onConfirm,
}: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const closingRef = useRef(false);
  const onConfirmRef = useRef(onConfirm);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setShowAnswer(true);
      onRevealRef.current();
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [message]);

  const closeResponse = useCallback(() => {
    if (closingRef.current) return;

    closingRef.current = true;
    setIsClosing(true);
    window.setTimeout(() => onConfirmRef.current(), 400);
  }, []);

  useEffect(() => {
    if (!showAnswer) return;

    const countdownTimer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    const closeTimer = window.setTimeout(closeResponse, 10000);

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(closeTimer);
    };
  }, [closeResponse, showAnswer]);

  if (typeof document === "undefined") return null;

  const messageSizeClass =
    message.length <= 30
      ? "text-2xl min-[1100px]:text-6xl"
      : message.length <= 70
        ? "text-xl min-[1100px]:text-4xl"
        : "text-lg min-[1100px]:text-3xl";

  return createPortal(
    <div className={`fixed inset-0 z-[70] overflow-hidden text-white ${
      showAnswer && message ? "bg-[#100205]" : "pointer-events-none bg-transparent"
    } ${isClosing ? "battle-response-out pointer-events-none" : ""}`}>
      {!showAnswer || !message ? (
        <div className="absolute inset-0 flex items-center">
          <div className="battle-response-suspense relative flex h-28 w-full items-center justify-center overflow-hidden border-y border-red-400/30 bg-[#100205]/95 md:h-36">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent" />
            <p className="relative text-xl font-black tracking-[0.15em] text-white/80 md:text-4xl">
              相手の反論は<span className="inline-block animate-pulse text-red-400">・・・・</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="battle-response-answer absolute inset-0">
          <div className="battle-response-flash absolute inset-0 bg-red-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(239,68,68,0.35),transparent_42%)]" />
          <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(65deg,transparent_47%,rgba(248,113,113,.7)_48%,transparent_49%)] [background-size:90px_90px]" />
          <div className="battle-response-slash absolute left-[-20%] top-[45%] h-3 w-[140%] rotate-6 bg-gradient-to-b from-white via-red-300 to-red-500" />
          <div className="battle-response-slash-secondary absolute left-[-20%] top-[56%] h-1.5 w-[140%] -rotate-3 bg-gradient-to-b from-red-200 to-red-600" />

          <div className="battle-response-copy absolute inset-x-4 bottom-[14%] z-20 min-[1100px]:left-[4%] min-[1100px]:right-auto min-[1100px]:top-1/2 min-[1100px]:bottom-auto min-[1100px]:w-[58%] min-[1100px]:-translate-y-1/2">
            <p className="mb-3 text-xs font-black tracking-[0.45em] text-red-300/70">COUNTER ARGUMENT</p>
            <div className="-skew-x-2 border-y-2 border-red-400/60 bg-red-950/90 px-5 py-6 min-[1100px]:-skew-x-3 min-[1100px]:px-12 min-[1100px]:py-12">
              <p className={`skew-x-3 break-words font-black leading-tight ${messageSizeClass}`}>
                「{message}」
              </p>
            </div>
          </div>

          <div className="battle-response-enemy absolute inset-x-0 top-[2%] z-10 flex h-[44%] items-center justify-center min-[1100px]:inset-y-0 min-[1100px]:left-auto min-[1100px]:right-[-3%] min-[1100px]:h-auto min-[1100px]:w-[45%]">
            <div className="absolute h-[38vw] w-[38vw] rounded-full border border-red-400/25 bg-[radial-gradient(circle,rgba(239,68,68,0.18),rgba(239,68,68,0.04)_55%,transparent_72%)]" />
            <div className="relative text-center">
              <img
                src={aiIcon}
                alt={aiName}
                className="mx-auto aspect-square max-h-[34vh] max-w-[58%] rounded-full border-4 border-red-300/30 bg-white object-cover shadow-2xl min-[1100px]:max-h-[48vh] min-[1100px]:max-w-[75%]"
              />
              <p className="mt-4 text-lg font-black tracking-wider text-red-100 md:text-2xl">{aiName}</p>
            </div>
          </div>

          <div className="battle-response-impact pointer-events-none absolute left-1/2 top-[44%] z-30 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-red-100 min-[1100px]:left-[60%] min-[1100px]:top-1/2 min-[1100px]:h-20 min-[1100px]:w-20" />

          <button
            type="button"
            disabled={isClosing}
            onClick={closeResponse}
            className="animate-in fade-in slide-in-from-bottom-3 absolute bottom-3 right-3 z-30 flex items-center gap-3 rounded-full border border-red-300/30 bg-red-600/90 px-5 py-2.5 text-sm font-black transition duration-300 hover:-translate-y-1 hover:bg-red-500 active:translate-y-0 md:bottom-10 md:right-10 md:px-8 md:py-4 md:text-lg"
          >
            （{countdown}）確認
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
