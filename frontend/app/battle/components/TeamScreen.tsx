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
    // await startTeamTimer();
    // stopTeamTimer();
    // onChangeScreen();
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
    <div>
      <div className="absolute top-20 right-30 w-28 h-28 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center">
        <span className="text-xs tracking-[0.2em] text-gray-400">
          TIME
        </span>

        <span
          className={`text-5xl font-black leading-none 
            `}
        >
          {time}
        </span>
      </div>

      <div className="relative z-10 w-[1200px] min-h-[850px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 flex gap-8">

        {/* バトル履歴 */}
        <div className="w-[300px] border-r border-white/10 pr-8">
          <h3 className="text-sm font-bold text-gray-400 mb-4">バトル履歴</h3>
          <div className="space-y-3 h-[700px] overflow-y-auto">
            {battleMessages.length === 0 ? (
              <p className="text-white/50 text-sm">ここにバトル画面の履歴が表示されます...</p>
            ) : (
              battleMessages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-sm ${m.role === "あなた" ? "bg-black/40" : "bg-black/60"
                    }`}
                >
                  <span className={`${m.role === "あなた" ? "text-blue-400" : "text-blue-200"} font-bold block mb-1`}>
                    {m.role === "あなた" ? "あなた" : "敵AI"}
                  </span>
                  <p className="text-gray-200">{m.text}</p>
                </div>
              ))
            )}
            <div ref={battleBottomRef} />
          </div>
        </div>

        {/* メイン */}
        <div className="flex-1 flex flex-col justify-between">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-gray-400">あなたは『<span>{stance}</span>』派です</h1>
              {selectedTopic && (
                <h1 className="text-2xl font-bold">
                  {selectedTopic.topic}
                </h1>
              )}
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">ROUND</p>
              <p className="text-5xl font-black">{round}</p>
            </div>
          </div>


          {/* チャット */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 h-[350px] mb-8 overflow-y-auto space-y-4">
            {teamMessages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "あなた" ? "justify-start" : "justify-end"
                  }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${m.role === "あなた"
                    ? "bg-white text-black rounded-br-none"
                    : "bg-white/10 text-white rounded-bl-none"
                    }`}
                >
                  <p className="text-xs mb-1">
                    {m.role}
                  </p>

                  <p className="font-bold break-words whitespace-pre-wrap">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}

            <div ref={teamBottomRef} />
          </div>

          {/* 入力 */}
          <div>
            <textarea
              className="w-full h-32 rounded-2xl bg-black/40 border border-white/10 p-6 text-sm text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="チームの方針をまとめる..."
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                className="bg-white/10 py-4 rounded-xl"
                onClick={() => {
                  handleSendMessage(input);
                  setInput("");
                }}
              >
                送信
              </button>

              <button
                className="bg-white text-black py-4 rounded-xl"
                onClick={() => {
                  onChangeScreen();
                  scrollTeamToBottom();
                }}
              >
                確定
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default TeamScreen
