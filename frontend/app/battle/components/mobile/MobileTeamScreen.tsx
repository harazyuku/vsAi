import { useGameLogic } from '@/hooks/useGameLogic/useGameLogic';
import { useTimer } from '@/hooks/useTimer';
import React, { useEffect, useState } from 'react'
import { AICharacter } from "@/app/config/aiConfig";

type Props = ReturnType<typeof useGameLogic> & {
  onChangeScreen: () => void;
  setShowRoundScreen: React.Dispatch<React.SetStateAction<boolean>>;
};

// チームロジック
function TeamScreen({
  wait,
  teamMessages,
  battleMessages,
  sendTeamMessage,

  onChangeScreen,
  setShowRoundScreen,

  teamBottomRef,
  battleBottomRef,
  scrollTeamToBottom,
  scrollBattleToBottom,

  round,

  stance,
  selectedTopic,

  createAllyPrompt,
  sendAllyAI,
  sendAiTeamMessage,
}: Props) {
  const { time, startTeamTimer, stopTeamTimer } = useTimer();
  const [input, setInput] = useState("");
  const [historyTab, setHistoryTab] = useState<"team" | "battle">("team");

  // 自分の発言〜aiが発言し画面に表示までのフロー
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    setInput("");

    sendTeamMessage(message);

    const prompt = createAllyPrompt(message);

    const aiResponse = await sendAllyAI(prompt);

    sendAiTeamMessage(aiResponse);
  };

  // フロー
  const teamFlow = async () => {
    setShowRoundScreen(true);
    await wait(2200);
    setShowRoundScreen(false);

    // 残り時間タイマースタート
    await startTeamTimer();
    stopTeamTimer();
    onChangeScreen();
  };


  useEffect(() => {

    teamFlow();
    return () => {

    };
  }, []);

  // メッセージが増えたらスクロール
  useEffect(() => {
    scrollTeamToBottom();
  }, [teamMessages]);

  useEffect(() => {
    scrollBattleToBottom();
  }, [battleMessages]);

  return (

    <div className="h-[100dvh] w-full overflow-hidden bg-transparent p-2 sm:p-4">

      <div
        className="
      w-full
      h-full
      rounded-2xl
      sm:rounded-3xl
      border border-white/10
      bg-transparent
      p-3
      sm:p-4
      flex
      flex-col
      gap-4
      overflow-hidden
    "
      >

        {/* ヘッダー */}
        <div className="flex shrink-0 items-start justify-between gap-3">

          <div className="min-w-0 flex-1">

            <p className="text-sm text-gray-400">
              あなたは
              <span className="text-white font-bold">
                「{stance}」
              </span>
              派
            </p>

            {selectedTopic && (
              <h1 className="line-clamp-3 break-words text-base font-bold leading-snug sm:text-lg">
                {selectedTopic.topic}
              </h1>
            )}

          </div>


          <div className="shrink-0 text-center">

            <p className="text-xs text-gray-400">
              ROUND
            </p>

            <p className="text-3xl font-black">
              {round}
            </p>

            <p className="text-xs text-gray-400">
              残り
            </p>

            <p className="text-xl font-black">
              {time}
            </p>
          </div>

        </div>





        {/* 履歴切替 */}
        <div
          className="
        grid
        grid-cols-2
        bg-black/40
        rounded-xl
        overflow-hidden
        border border-white/10
        shrink-0
      "
        >

          <button
            onClick={() => setHistoryTab("team")}
            className={`
          py-3
          text-sm
          transition
          ${historyTab === "team"
                ? "bg-white text-black font-bold"
                : "text-white"
              }
        `}
          >
            チーム履歴
          </button>


          <button
            onClick={() => setHistoryTab("battle")}
            className={`
          py-3
          text-sm
          transition
          ${historyTab === "battle"
                ? "bg-white text-black font-bold"
                : "text-white"
              }
        `}
          >
            バトル履歴
          </button>

        </div>







        {/* 履歴表示 */}
        <div
          className="
        flex-1
        min-h-0
        overflow-y-auto
        bg-black/40
        rounded-2xl
        border border-white/10
        p-4
        space-y-3
      "
        >

          {historyTab === "team" && (

            teamMessages.length === 0 ? (

              <p className="text-white/50 text-sm">
                チーム履歴はありません
              </p>

            ) : (

              teamMessages.map((m, i) => (

                <div
                  key={i}
                  className={`
                max-w-[85%]
                rounded-2xl
                px-4
                py-3
                ${m.role === "あなた"
                      ? "bg-white text-black"
                      : "bg-white/10 text-white ml-auto"
                    }
              `}
                >

                  <p className="text-xs opacity-60 mb-1">
                    {m.role}
                  </p>


                  <p
                    className="
                  font-bold
                  whitespace-pre-wrap
                  break-words
                "
                  >
                    {m.text}
                  </p>

                </div>

              ))

            )

          )}





          {historyTab === "battle" && (

            battleMessages.length === 0 ? (

              <p className="text-white/50 text-sm">
                バトル履歴はありません
              </p>

            ) : (

              battleMessages.map((m, i) => (

                <div
                  key={i}
                  className={`
                max-w-[85%]
                rounded-2xl
                px-4
                py-3
                ${m.role === "あなた"
                      ? "bg-blue-500/20 text-white"
                      : "bg-red-500/20 text-white ml-auto"
                    }
              `}
                >

                  <p className="text-xs opacity-60 mb-1">
                    {m.role === "あなた" ? "あなた" : "敵AI"}
                  </p>


                  <p
                    className="
                  font-bold
                  whitespace-pre-wrap
                  break-words
                "
                  >
                    {m.text}
                  </p>

                </div>

              ))

            )

          )}
          <div ref={teamBottomRef} />
        </div>







        {/* 入力 */}
        <div className="shrink-0">

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="チームの方針をまとめる..."
            className="
          w-full
          h-20
          sm:h-24
          rounded-2xl
          bg-black/40
          border border-white/10
          p-3
          sm:p-4
          text-sm
          text-white
          resize-none
        "
          />


          <div className="grid grid-cols-2 gap-3 mt-3">

            <button
              onClick={() => {
                handleSendMessage(input);
                setInput("");
              }}
              className="
            rounded-xl bg-blue-500/30 py-3 sm:py-4
            transition-all duration-200
            hover:-translate-y-1 hover:bg-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20
            active:translate-y-0
          "
            >
              チームに送信
            </button>


            <button
              onClick={() => {
                onChangeScreen();
                scrollTeamToBottom();
              }}
              className="
            rounded-xl bg-red-500/30 py-3 sm:py-4
            transition-all duration-200
            hover:-translate-y-1 hover:bg-red-500/40 hover:shadow-lg hover:shadow-red-500/20
            active:translate-y-0
          "
            >
              バトルフェーズへ
            </button>

          </div>


        </div>


      </div>

    </div>
  )
}

export default TeamScreen
