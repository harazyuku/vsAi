"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startSoloPlay } from "@/lib/playModeSession";

const slides = [
  {
    icon: "⚔️",
    title: "AIと論破バトル",
    catchphrase: "味方AIと協力して、敵AIを言葉で打ち破れ",
    content: (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center md:gap-6">
        <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
          <div className="text-5xl">🧑</div>
          <p className="mt-3 font-black text-blue-300">あなた</p>
        </div>
        <div className="text-2xl font-black italic text-yellow-300 md:text-4xl">VS</div>
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
          <div className="text-5xl">🤖</div>
          <p className="mt-3 font-black text-red-300">敵AI</p>
        </div>
      </div>
    ),
  },
  {
    icon: "🎭",
    title: "戦いの条件が決まる",
    catchphrase: "ゲーム開始時に3つの要素が決定",
    content: (
      <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3 min-[480px]:gap-3">
        {[
          ["📜", "お題", "何を議論する？"],
          ["⚖️", "立場", "どちら側で戦う？"],
          ["👤", "敵AI", "誰と戦う？"],
        ].map(([icon, label, description]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center">
            <div className="text-4xl">{icon}</div>
            <p className="mt-3 font-black text-cyan-300">{label}</p>
            <p className="mt-1 text-xs text-white/55 md:text-sm">{description}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "🔁",
    title: "1ラウンドの流れ",
    catchphrase: "相談して、考えて、一言でぶつけろ",
    content: (
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {[
          ["1", "💬", "作戦会議", "味方AIと意見をまとめる"],
          ["2", "✍️", "主張を入力", "制限時間内に一言を作る"],
          ["3", "💥", "論破バトル", "敵AIへ主張をぶつける"],
        ].map(([number, icon, label, description], index) => (
          <div key={number} className="contents">
            {index > 0 && (
              <span className="rotate-90 self-center text-2xl text-cyan-300 md:rotate-0">→</span>
            )}
            <div className="relative flex-1 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.07] p-4 text-center">
              <span className="absolute left-3 top-2 text-xs font-black text-cyan-300/60">
                STEP {number}
              </span>
              <div className="text-4xl">{icon}</div>
              <p className="mt-2 font-black">{label}</p>
              <p className="mt-1 text-xs text-white/55">{description}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "⏱️",
    title: "5ラウンド戦い抜け",
    catchphrase: "履歴を見返し、前の議論を次の反論に活かそう",
    content: (
      <div className="flex items-center justify-center gap-1 md:gap-3">
        {[1, 2, 3, 4, 5].map((round) => (
          <div key={round} className="flex items-center gap-1 md:gap-3">
            {round > 1 && <span className="text-white/25">→</span>}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full border font-black md:h-16 md:w-16 ${
                round === 5
                  ? "border-yellow-300 bg-yellow-300 text-black shadow-[0_0_30px_rgba(253,224,71,.25)]"
                  : "border-white/20 bg-white/5"
              }`}
            >
              {round}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "⚖️",
    title: "AI審判がジャッジ",
    catchphrase: "全ラウンドの議論を4つの基準で採点",
    content: (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["🧠", "論理性"],
          ["📣", "説得力"],
          ["🛡️", "反論の質"],
          ["🧩", "全体構成"],
        ].map(([icon, label]) => (
          <div key={label} className="rounded-2xl border border-yellow-300/20 bg-yellow-300/[0.06] p-4 text-center">
            <div className="text-3xl">{icon}</div>
            <p className="mt-2 font-bold">{label}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "🏆",
    title: "勝敗発表",
    catchphrase: "結果を振り返って、次のバトルに活かそう",
    content: (
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 min-[420px]:gap-3">
        {[
          ["🏆", "勝者"],
          ["📊", "両者のスコア"],
          ["📝", "判定理由"],
          ["💡", "あなたへの助言"],
        ].map(([icon, label]) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <span className="text-2xl">{icon}</span>
            <span className="font-bold">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
];

function HowToPlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);

  const last = page === slides.length - 1;
  const startsGame = searchParams.get("from") === "start";
  const destination = startsGame ? "/battle/story" : "/top";

  useEffect(() => {
    if (startsGame) startSoloPlay();
  }, [startsGame]);

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-black p-3 pt-20 text-white sm:p-4">
      {startsGame && (
        <button
          type="button"
          onClick={() => router.push("/battle/story")}
          className="absolute right-5 top-5 z-10 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 font-bold text-white/80 transition hover:bg-white/20 hover:text-white md:right-8 md:top-8"
        >
          スキップ →
        </button>
      )}

      <div className="w-full max-w-[800px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:rounded-3xl sm:p-6 md:p-10">
        <div className="mb-7 flex gap-2">
          {slides.map((slide, index) => (
            <div
              key={slide.title}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= page ? "bg-cyan-400" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <div className="text-5xl">{slides[page].icon}</div>
          <p className="mt-3 text-xs font-black tracking-[0.2em] text-cyan-300">
            HOW TO PLAY · {page + 1}/{slides.length}
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">{slides[page].title}</h1>
          <p className="mt-3 text-sm font-medium text-white/60 md:text-base">
            {slides[page].catchphrase}
          </p>
        </div>

        <div className="mt-8 min-h-[190px] text-base md:min-h-[210px] md:text-lg">
          {slides[page].content}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage((currentPage) => currentPage - 1)}
            className="rounded-xl bg-white/10 px-6 py-3 font-bold transition hover:bg-white/20 disabled:opacity-30"
          >
            ← 戻る
          </button>

          <button
            onClick={() => {
              if (last) {
                router.push(destination);
              } else {
                setPage((currentPage) => currentPage + 1);
              }
            }}
            className="rounded-xl bg-cyan-400 px-7 py-3 font-black text-black transition hover:scale-105 hover:bg-cyan-300"
          >
            {last ? (startsGame ? "ゲーム開始 ⚔️" : "閉じる") : "次へ →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HowToPlay() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HowToPlayContent />
    </Suspense>
  );
}
