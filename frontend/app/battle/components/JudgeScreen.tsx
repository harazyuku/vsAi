"use client";

import Link from "next/link";

export interface JudgeResult {
  winner: "あなた" | "AI";
  score: {
    user: number;
    ai: number;
  };
  reason: string;
  feedbackUser: string;
  feedbackAi: string;
}

interface JudgeScreenProps {
  isLoading: boolean;
  result: JudgeResult | null;
  onReset: () => void;
}

export default function JudgeScreen({
  isLoading,
  result,
  onReset,
}: JudgeScreenProps) {
  if (isLoading) {
    return (
      <div className="relative z-10 w-[900px] h-[850px] flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* ローディングのアニメーションサークル */}
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <span className="text-2xl font-bold text-white/80">⚖️</span>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-wider animate-pulse text-white">AI審判が判定中...</h2>
            <p className="text-sm text-gray-400">
              5ラウンドに及ぶディベート履歴を徹底的に分析しています。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="relative z-10 w-[900px] h-[850px] flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
        <p className="text-red-400 mb-4">判定結果の取得に失敗したか、データが存在しません。</p>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition"
        >
          タイトルへ戻る
        </button>
      </div>
    );
  }

  const isUserWinner = result.winner === "あなた";

  return (
    <div className="relative z-10 w-[900px] h-[850px] flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 overflow-y-auto">
      
      {/* ヘッダー */}
      <div className="text-center border-b border-white/10 pb-4">
        <span className="px-3 py-1 text-xs font-bold tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
          JUDGMENT RESULT
        </span>
        <h1 className="text-3xl font-black mt-2 tracking-wide">最終判定結果</h1>
      </div>

      {/* 勝者発表 */}
      <div className="flex flex-col items-center py-6">
        <div className="text-sm text-gray-400 mb-1">ディベート勝者</div>
        <div className={`text-5xl font-black tracking-widest px-8 py-3 rounded-2xl ${
          isUserWinner 
            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
            : "bg-red-600/20 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        }`}>
          {result.winner === "あなた" ? "🏆 あなたの勝利 🏆" : "相手側の勝利"}
        </div>
      </div>

      {/* スコア表示 */}
      <div className="grid grid-cols-2 gap-6 bg-black/30 p-6 rounded-2xl border border-white/5">
        {/* プレイヤーのスコア */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-blue-400 flex items-center gap-1">👤 あなた</span>
            <span className="text-2xl font-bold">{result.score.user}点</span>
          </div>
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
              style={{ width: `${result.score.user}%` }}
            ></div>
          </div>
        </div>

        {/* AIのスコア */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-red-400 flex items-center gap-1">😈 相手</span>
            <span className="text-2xl font-bold">{result.score.ai}点</span>
          </div>
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-1000"
              style={{ width: `${result.score.ai}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 判定理由 */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <span>⚖️</span> 判定理由・総評
        </h3>
        <p className="text-sm text-gray-200 leading-relaxed">
          {result.reason}
        </p>
      </div>

      {/* 個別フィードバック */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-blue-950/20 border border-blue-500/20 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-blue-400 mb-2">👤 あなたへのアドバイス</h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            {result.feedbackUser}
          </p>
        </div>

        <div className="bg-red-950/20 border border-red-500/20 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-red-400 mb-2">AI（相手側）の評価</h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            {result.feedbackAi}
          </p>
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="pt-4">
        <Link
          onClick={onReset}
          href="/"
          className="flex justify-center items-center w-full py-4 bg-gradient-to-r from-white to-gray-200 text-black font-bold rounded-2xl text-lg hover:from-gray-100 hover:to-gray-300 transition duration-200 shadow-md transform active:scale-[0.98]"
        >
          Homeに戻る
        </Link>
      </div>
    </div>
  );
}
