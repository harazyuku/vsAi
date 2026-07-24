"use client";

import { IoExpand, IoSend } from "react-icons/io5";

type Props = {
  value: string;
  time: number;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onExpand: () => void;
};

export default function BattleCompactInput({
  value,
  time,
  disabled,
  onChange,
  onSubmit,
  onExpand,
}: Props) {
  const isTimeCritical = time <= 10;

  return (
    <div className="rounded-2xl border border-blue-400/25 bg-blue-950/70 p-3 shadow-lg shadow-blue-950/20">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black tracking-[0.3em] text-cyan-300/50">
            YOUR ARGUMENT
          </p>
          <p className="text-xs font-bold text-white/65">反論を入力</p>
        </div>

        <div className="flex items-center gap-3">
          <p className={`font-mono text-xl font-black tabular-nums ${
            isTimeCritical ? "animate-pulse text-red-300" : "text-cyan-200/70"
          }`}>
            {time}
          </p>
          <button
            type="button"
            onClick={onExpand}
            aria-label="入力画面を大きく表示"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <IoExpand />
          </button>
        </div>
      </div>

      <div className="relative border-b border-blue-300/25">
        <textarea
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              onSubmit();
            }
          }}
          className="h-20 w-full resize-none bg-transparent px-3 py-2 pr-14 text-base font-bold leading-relaxed text-white outline-none disabled:opacity-50"
        />

        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={onSubmit}
          aria-label="送信"
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-blue-500/20 text-white/55 transition hover:bg-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
        >
          <IoSend />
        </button>
      </div>
    </div>
  );
}
