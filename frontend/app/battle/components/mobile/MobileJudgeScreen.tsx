import Link from "next/link";
import { useState } from "react";
import JudgeResultReveal from "../JudgeResultReveal";

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
  judgeResult: JudgeResult | null;
  stance: string;
  aiStance: string;
  isCourt: boolean;
  resultBackground?: string;
}

function JudgeScreen({
  judgeResult,
  stance,
  aiStance,
  isCourt,
  resultBackground,
}: JudgeScreenProps) {
  const [showReveal, setShowReveal] = useState(true);
  console.log("JudgeScreen - judgeResult received:", judgeResult);

  if (!judgeResult) {
    return (
      <div
        className="
          relative
          z-10
          w-full
          max-w-[900px]
          min-h-screen
          md:h-[850px]
          flex
          flex-col
          items-center
          justify-center
          rounded-none
          md:rounded-2xl
          border border-white/10
          bg-black/45
          p-6
        "
      >
        <div className="flex flex-col items-center gap-6">

          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <span className="text-2xl font-bold text-white/80">
              ⚖️
            </span>
          </div>


          <div className="text-center space-y-2">

            <h2 className="text-2xl md:text-3xl font-bold tracking-wider animate-pulse text-white">
              AI審判が判定中...
            </h2>

            <p className="text-sm md:text-base text-gray-300">
              3ラウンドに及ぶディベート履歴を徹底的に分析しています。
            </p>

          </div>

        </div>
      </div>
    );
  }


  const isUserWinner = judgeResult.winner === "あなた";
  const plaintiffWon =
    (stance === "原告" && isUserWinner) ||
    (aiStance === "原告" && !isUserWinner);
  const verdictBackground =
    resultBackground ??
    (isCourt
      ? plaintiffWon
        ? "/back-images/syouso.webp"
        : "/back-images/haiso.webp"
      : undefined);


  return (
    <>
    {showReveal && (
      <JudgeResultReveal
        winnerLabel={isUserWinner ? "あなたの勝利" : "相手の勝利"}
        verdictText={isCourt ? (plaintiffWon ? "勝 訴" : "敗 訴") : (isUserWinner ? "勝 利" : "敗 北")}
        winnerSide={isUserWinner ? "player" : "enemy"}
        backgroundImage={verdictBackground}
        onComplete={() => setShowReveal(false)}
      />
    )}
    <div
      className="
        relative
        z-10
        w-full
        max-w-[900px]
        min-h-screen
        flex
        flex-col
        gap-6
        rounded-none
        md:rounded-2xl
        border border-white/10
        bg-black/45
        p-4
        md:p-8
      "
    >


      {/* ヘッダー */}
      <div className="text-center border-b border-white/10 pb-4 shrink-0">

        <span className="px-3 py-1 text-sm font-bold tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
          JUDGMENT RESULT
        </span>


        <h1 className="text-3xl md:text-4xl font-black mt-3 tracking-wide">
          最終判定結果
        </h1>

      </div>




      {/* 勝者 */}
      <div className="flex flex-col items-center py-4 md:py-6">

        <div className="text-base text-gray-300 mb-2">
          ディベート勝者
        </div>


        <div
          className={`
            text-3xl
            md:text-5xl
            font-black
            tracking-widest
            px-5
            md:px-8
            py-3
            rounded-2xl
            text-center
            ${
              isUserWinner
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
              : "bg-red-600/20 text-red-400 border border-red-500/30"
            }
          `}
        >
          {
            judgeResult.winner === "あなた"
            ? "🏆 あなたの勝利 🏆"
            : "相手の勝利"
          }

        </div>

      </div>




      {/* スコア */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
          bg-black/30
          p-4
          md:p-6
          rounded-2xl
          border border-white/5
        "
      >

        <div className="space-y-2">

          <div className="flex justify-between items-center text-base font-semibold">

            <span className="text-blue-400">
              👤 あなた
            </span>

            <span className="text-xl md:text-2xl font-bold">
              {judgeResult.score.user}点
            </span>

          </div>


          <div className="h-3 bg-white/10 rounded-full overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              style={{
                width:`${judgeResult.score.user}%`
              }}
            />

          </div>

        </div>




        <div className="space-y-2">

          <div className="flex justify-between items-center text-base font-semibold">

            <span className="text-red-400">
              😈 相手
            </span>

            <span className="text-xl md:text-2xl font-bold">
              {judgeResult.score.ai}点
            </span>

          </div>


          <div className="h-3 bg-white/10 rounded-full overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
              style={{
                width:`${judgeResult.score.ai}%`
              }}
            />

          </div>


        </div>


      </div>





      {/* 判定理由 */}
      <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl">

        <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-2">
          ⚖️ 判定理由・総評
        </h3>


        <p className="text-base md:text-lg text-gray-100 leading-relaxed break-words">
          {judgeResult.reason}
        </p>

      </div>





      {/* フィードバック */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
          md:gap-6
        "
      >

        <div className="bg-blue-950/20 border border-blue-500/20 p-4 md:p-5 rounded-2xl">

          <h4 className="text-base font-bold text-blue-400 mb-2">
            👤 あなたへのアドバイス
          </h4>

          <p className="text-sm md:text-base text-gray-200 leading-relaxed break-words">
            {judgeResult.feedbackUser}
          </p>

        </div>



        <div className="bg-red-950/20 border border-red-500/20 p-4 md:p-5 rounded-2xl">

          <h4 className="text-base font-bold text-red-400 mb-2">
            AI（相手側）の評価
          </h4>

          <p className="text-sm md:text-base text-gray-200 leading-relaxed break-words">
            {judgeResult.feedbackAi}
          </p>

        </div>


      </div>




      {/* ボタン */}
      <div className="pt-2">

        <Link
          href="/top"
          className="
            flex
            justify-center
            items-center
            w-full
            py-4
            bg-gradient-to-r
            from-white
            to-gray-200
            text-black
            font-bold
            rounded-2xl
            text-base
            md:text-lg
          "
        >
          Homeに戻る
        </Link>

      </div>


    </div>
    </>
  );
}


export default JudgeScreen;
