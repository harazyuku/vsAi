"use client";

import { createPortal } from "react-dom";
import { IoList, IoSend } from "react-icons/io5";

type Props = {
  value: string;
  time: number;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onViewHistory: () => void;
  viewerMode?: boolean;
};

export default function BattleInputScreen({
  value,
  time,
  disabled,
  onChange,
  onSubmit,
  onViewHistory,
  viewerMode = false,
}: Props) {
  if (typeof document === "undefined") return null;

  const inputSizeClass =
    value.length <= 20
      ? "text-4xl md:text-6xl"
      : value.length <= 50
        ? "text-3xl md:text-5xl"
        : value.length <= 90
          ? "text-2xl md:text-3xl"
          : "text-xl md:text-2xl";
  const isTimeCritical = time <= 10;

  return createPortal(
    <div className="battle-input-screen-in fixed inset-0 z-[60] flex items-center bg-black/70 text-white">
      <section className="battle-input-panel-in relative h-[min(400px,72dvh)] min-h-[320px] w-full overflow-hidden border-y border-blue-400/40 bg-[#061229] shadow-[0_0_80px_rgba(37,99,235,0.35)] md:h-[360px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <div className="absolute -left-20 top-0 h-full w-80 -skew-x-12 bg-blue-600/10" />
        <div className="absolute -right-20 top-0 h-full w-80 -skew-x-12 bg-cyan-400/[0.06]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,rgba(96,165,250,.8)_1px,transparent_1px)] [background-size:80px_100%]" />
        <div className={`absolute right-4 top-4 z-20 min-w-24 border-l-2 px-3 text-right md:right-8 md:top-6 md:px-4 ${
          isTimeCritical ? "border-red-400 text-red-300" : "border-cyan-300/50 text-cyan-200"
        }`}>
          <p className="text-[9px] font-black tracking-[0.3em] opacity-60 md:text-[10px]">
            TIME LIMIT
          </p>
          <p className={`font-mono text-2xl font-black tabular-nums md:text-3xl ${
            isTimeCritical ? "animate-pulse" : ""
          }`}>
            {time}
          </p>
        </div>

        <button
          type="button"
          onClick={onViewHistory}
          className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full border border-blue-200/15 bg-blue-400/10 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-cyan-300/30 hover:bg-cyan-300/15 hover:text-white md:left-8 md:top-6 md:text-sm"
        >
          <IoList className="text-lg" />
          履歴を見る
        </button>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] flex-col justify-center px-4 md:px-8">
          <div className="relative mb-2 text-center">
            <div className="w-full">
              <p className="mb-1 text-[10px] font-black tracking-[0.5em] text-cyan-300/60 md:text-xs">
                TEAM&apos;S FINAL ARGUMENT
              </p>
              <h2 className="mx-auto max-w-[75%] text-base font-black leading-snug text-white sm:max-w-none sm:text-xl md:text-2xl">
                {viewerMode
                  ? "リーダーが入力中・・・"
                  : "作戦会議でまとめた意見を使って、相手を論破する主張を入力してください。"}
              </h2>
            </div>
            <p className="absolute bottom-0 right-0 hidden text-right text-[10px] tracking-[0.25em] text-blue-200/35 md:block">
              CTRL / ⌘ + ENTER
            </p>
          </div>

          <div className="relative border-b-2 border-blue-300/30 bg-transparent">
            <textarea
              autoFocus={!viewerMode}
              value={value}
              disabled={disabled}
              readOnly={viewerMode}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (!viewerMode && (event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  onSubmit();
                }
              }}
              className={`h-36 w-full resize-none bg-transparent px-4 py-5 text-center font-black leading-tight text-white outline-none transition-[font-size] duration-200 disabled:opacity-60 sm:h-40 md:h-48 md:px-6 md:py-6 ${viewerMode ? "cursor-default" : "pr-16 sm:pr-20 md:pr-24"} ${inputSizeClass}`}
            />

            {!viewerMode && (
              <button
                type="button"
                disabled={disabled || !value.trim()}
                onClick={onSubmit}
                aria-label="送信"
                className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full border border-blue-200/15 bg-blue-400/10 text-xl text-white/45 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/15 hover:text-white/80 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 md:bottom-4 md:right-4 md:h-14 md:w-14 md:text-2xl"
              >
                <IoSend />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
