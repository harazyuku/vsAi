"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    title: "AI Debate Arenaへようこそ",
    content: (
      <>
        <p className="text-lg leading-8">
          このゲームはAIと1対1でディベートを行うゲームです。
        </p>

        <p className="mt-4 text-gray-300 leading-8">
          味方AIと協力しながら、
          5ラウンドにわたる討論に挑みます。
        </p>
      </>
    ),
  },
  {
    title: "対戦相手",
    content: (
      <>
        <p className="leading-8">
          ゲーム開始時に対戦相手AIがランダムで決定されます。
        </p>

        <div className="mt-6 rounded-xl bg-white/5 p-4">
          <p>
            <span className="font-bold text-cyan-400">モデル：</span>
            Gemini 3.1 Flash
          </p>
        </div>

        <p className="mt-6 text-gray-300 leading-8">
          強さは……そこそこ。
          油断すると普通に負けます。
        </p>
      </>
    ),
  },
  {
    title: "ゲームの流れ",
    content: (
      <>
        <ol className="space-y-6">
          <li>
            <span className="font-bold text-cyan-400">
              ① 味方AIと作戦会議
            </span>
            <p className="mt-2 text-gray-300">
              味方AI（Llama 3.3）と一緒に、お題について意見をまとめます。
            </p>
          </li>

          <li>
            <span className="font-bold text-cyan-400">② ディベート</span>
            <p className="mt-2 text-gray-300">
              作戦会議でまとめた内容をもとに相手AIへ反論します。
            </p>
          </li>

          <li>
            <span className="font-bold text-cyan-400">
              ③ 5ラウンド繰り返す
            </span>
            <p className="mt-2 text-gray-300">
              作戦会議 → ディベートを5回行います。
            </p>
          </li>
        </ol>
      </>
    ),
  },
  {
    title: "AI審判",
    content: (
      <>
        <p className="leading-8">
          5ラウンド終了後、
          Gemini 3.1 Flash が議論全体を分析します。
        </p>

        <div className="mt-6 rounded-xl bg-white/5 p-5">
          <ul className="space-y-2">
            <li>✔ 論理性</li>
            <li>✔ 説得力</li>
            <li>✔ 反論の質</li>
            <li>✔ 全体の構成</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: "結果発表",
    content: (
      <>
        <p className="leading-8">
          AI審判が勝敗を判定します。
        </p>

        <div className="mt-6 rounded-xl bg-white/5 p-5">
          <ul className="space-y-3">
            <li>🏆 勝者</li>
            <li>📊 両者のスコア</li>
            <li>📝 判定理由</li>
            <li>💡 あなたへのアドバイス</li>
            <li>🤖 相手AIへの評価</li>
          </ul>
        </div>

        <p className="mt-6 text-gray-300">
          フィードバックを参考にして、
          次のディベートに挑みましょう。
        </p>
      </>
    ),
  },
];

export default function HowToPlay() {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const last = page === slides.length - 1;

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="w-[800px] rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
        <p className="text-sm text-gray-400">
          {page + 1} / {slides.length}
        </p>

        <h1 className="mt-2 text-4xl font-bold">{slides[page].title}</h1>

        <div className="mt-8 min-h-[300px] text-lg">
          {slides[page].content}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl bg-white/10 px-6 py-3 disabled:opacity-30"
          >
            戻る
          </button>

          <button
            onClick={() => {
              if (last) {
                router.push("/top");
              } else {
                setPage((p) => p + 1);
              }
            }}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-black"
          >
            {last ? "閉じる" : "次へ →"}
          </button>
        </div>
      </div>
    </div>
  );
}