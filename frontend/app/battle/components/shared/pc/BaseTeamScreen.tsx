import { useGameLogic } from '@/hooks/useGameLogic/useGameLogic';
import { useTimer } from '@/hooks/useTimer';
import React, { useEffect, useState } from 'react'

type Props = ReturnType<typeof useGameLogic> & {
  onChangeScreen: () => void;
  setShowRoundScreen: React.Dispatch<React.SetStateAction<boolean>>;
  isMultiplayer: boolean;
  sendSharedTeamMessage: (message: string) => void;
  onBattlePhaseRequest?: () => void;
  isBattleReady?: boolean;
  battleReadyLabel?: string;
  teamRoleLabel?: string;
};

// チームロジック
function BaseTeamScreen({
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
  isMultiplayer,
  sendSharedTeamMessage,
  onBattlePhaseRequest,
  isBattleReady = false,
  battleReadyLabel,
  teamRoleLabel,
}: Props) {
  const { time, startTeamTimer, stopTeamTimer } = useTimer();
  const [input, setInput] = useState("");

  // 自分の発言〜aiが発言し画面に表示までのフロー
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    setInput("");

    if (isMultiplayer) {
      sendSharedTeamMessage(message);
      return;
    }

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
    if (isMultiplayer) {
      onBattlePhaseRequest?.();
    } else {
      onChangeScreen();
    }
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

      <div className="relative z-10 w-[1200px] min-h-[850px] rounded-3xl border border-white/10 bg-black/45 p-8 flex gap-8">

        {/* バトル履歴 */}
        <div className="w-[300px] border-r border-white/10 pr-8">
          <h3 className="text-base font-bold text-gray-300 mb-4">バトル履歴</h3>
          <div className="space-y-3 h-[700px] overflow-y-auto">
            {battleMessages.length === 0 ? (
              <p className="text-white/50 text-base">ここにバトル画面の履歴が表示されます...</p>
            ) : (
              battleMessages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-base leading-relaxed ${m.role === "敵AI" ? "bg-black/60" : "bg-black/40"
                    }`}
                >
                  <span className={`${m.role === "敵AI" ? "text-blue-200" : "text-blue-400"} font-bold block mb-1`}>
                    {m.role}
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
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl text-gray-400">あなたは<span className='text-blue-500'>『{stance}』</span>派です</h1>
                {teamRoleLabel && (
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-200">
                    {teamRoleLabel}
                  </span>
                )}
              </div>
              {selectedTopic && (
                <h1 className="text-2xl font-bold">
                  {selectedTopic.topic}
                </h1>
              )}
            </div>

            <div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">ROUND</p>
                <p className="text-5xl font-black">{round}</p>
              </div>
              <div className="text-center mt-2">
                <p className="text-gray-400 text-sm">残り</p>
                <p className="text-3xl font-black">{time}</p>
              </div>
            </div>
          </div>


          {/* チャット */}
          <div 
          className="bg-black/40 border border-white/10 rounded-2xl p-6 h-[350px] mb-8 overflow-y-auto space-y-4">
            {teamMessages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "あなた" ? "justify-start" : "justify-end"
                  }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl text-base leading-relaxed ${m.role === "あなた"
                    ? "bg-white text-black rounded-br-none"
                    : "bg-white/10 text-white rounded-bl-none"
                    }`}
                >
                  <p className="text-sm mb-1 opacity-70">
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
              className="w-full h-32 rounded-2xl bg-black/40 border border-white/10 p-6 text-base text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="チームの方針をまとめる..."
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                className="rounded-xl bg-blue-500/30 py-4 transition-all duration-200 hover:-translate-y-1 hover:bg-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0"
                onClick={() => {
                  handleSendMessage(input);
                  setInput("");
                }}
              >
                チームに送信
              </button>

              <button
                disabled={isBattleReady}
                className="rounded-xl bg-red-500/30 py-4 transition-all duration-200 hover:-translate-y-1 hover:bg-red-500/40 hover:shadow-lg hover:shadow-red-500/20 active:translate-y-0 disabled:cursor-wait disabled:opacity-55 disabled:hover:translate-y-0"
                onClick={() => {
                  if (isMultiplayer) {
                    onBattlePhaseRequest?.();
                  } else {
                    onChangeScreen();
                  }
                  scrollTeamToBottom();
                }}
              >
                {battleReadyLabel ?? "バトルフェーズへ"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default BaseTeamScreen
