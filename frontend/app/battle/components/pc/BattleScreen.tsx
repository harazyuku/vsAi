
import { useGameLogic } from '@/hooks/useGameLogic/useGameLogic';
import { useTimer } from '@/hooks/useTimer';
import React, { useEffect, useRef, useState } from 'react'
import { TypeAnimation } from "react-type-animation";

type Props = ReturnType<typeof useGameLogic> & {
  onChangeScreen: () => void;
  setShowRoundScreen: React.Dispatch<React.SetStateAction<boolean>>;
};

// チームロジック
function BattleScreen({
  wait,
  teamMessages,
  battleMessages,
  sendBattleMessage,
  sendAiBattleMessage,
  timeUpMessage,

  onChangeScreen,
  setShowRoundScreen,

  teamBottomRef,
  battleBottomRef,
  scrollTeamToBottom,
  scrollBattleToBottom,

  createBattlePrompt,
  sendAI,
  selectedAI,
  typedMessageIds,
  setTypedMessageIds,

  nextRound,
  round,

  stance,
  selectedTopic,
}: Props) {
  const { time, startBattleTimer, stopBattleTimer } = useTimer();
  const [input, setInput] = useState("");
  const inputRef = useRef("");

  const [isAITyping, setIsAITyping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 自分の発言〜aiが発言し画面に表示までのフロー
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    setInput("");
    inputRef.current = "";
    stopBattleTimer();
    setIsAITyping(true);
    setShowConfirm(false);

    sendBattleMessage(message);

    const prompt = createBattlePrompt(message);

    const aiResponse = await sendAI(prompt);

    sendAiBattleMessage(aiResponse);
  };

  // フロー
  const battleFlow = async () => {
   setShowRoundScreen(true);
    await wait(2200);
    setShowRoundScreen(false);

    // 残り時間タイマースタート
    await startBattleTimer();

    const message = inputRef.current.trim() || timeUpMessage();

    await handleSendMessage(message);
    // onChangeScreen();
  };


  useEffect(() => {

    battleFlow();
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
      <div className="relative z-10 w-[1200px] min-h-[850px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 flex gap-8">
        {/* チーム履歴サイドバー */}
        <div className="w-[300px] border-r border-white/10 pr-8">
          <h3 className="text-sm font-bold text-gray-400 mb-4">チームの戦略履歴</h3>
          <div className="space-y-3 h-[700px] overflow-y-auto">
            {teamMessages.length === 0 ? (
              <p className="text-white/50 text-sm">チームの議論履歴はありません...</p>
            ) : (
              teamMessages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-sm ${m.role === "あなた" ? "bg-black/40" : "bg-black/60"
                    }`}
                >
                  <span className={`${m.role === "あなた" ? "text-blue-400" : "text-blue-200"} font-bold block mb-1`}>
                    {m.role === "あなた" ? "あなた" : "仲間"}
                  </span>
                  <p className="text-gray-200">{m.text}</p>
                </div>
              ))
            )}
            <div ref={teamBottomRef} />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-gray-400">あなたは『<span>{stance}</span>』派です</h1>
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

          {/* 中心アイコン */}
          <div className="relative flex-1 rounded-3xl border border-white/10 bg-black/30 p-8">

            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-blue-300 text-sm">チーム人類の意見</p>
                <h2 className="text-2xl font-bold">👤 あなた</h2>
              </div>

              <div className="text-right">
                <p className="text-red-300 text-sm">相手の意見</p>
                {selectedAI && (
                  <h2 className="text-2xl font-bold flex items-center justify-end gap-3">
                    {selectedAI.name}
                    <img
                      src={selectedAI.icon}
                      alt={selectedAI.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </h2>
                )}
              </div>
            </div>

            {/* チャット欄 */}
            <div className="h-[300px] overflow-y-auto space-y-6">
              {battleMessages.map((m, i) => {
                const isTyped = typedMessageIds.includes(i);

                return (
                  <div
                    key={i}
                    className={`flex ${m.role === "あなた"
                      ? "justify-start"
                      : "justify-end"
                      }`}
                  >
                    <div
                      className={`max-w-[70%] px-5 py-4 rounded-2xl ${m.role === "あなた"
                        ? "bg-blue-500/20 border border-blue-500/30 rounded-bl-none"
                        : "bg-red-500/20 border border-red-500/30 rounded-br-none"
                        }`}
                    >
                      <p className="text-xs mb-1">
                        {m.role}
                      </p>

                      {m.role === "敵AI" && !isTyped ? (
                        <TypeAnimation
                          sequence={[
                            m.text,
                            () => {
                              setTypedMessageIds(prev => [...prev, i]);
                              setIsAITyping(false);
                              setShowConfirm(true);
                            }
                          ]}
                        />
                      ) : (
                        <p>{m.text}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={battleBottomRef} />
            </div>
          </div>

          {/* 入力欄 */}
          <div className="space-y-4">
            <textarea
              className="w-full h-32 rounded-2xl bg-black/40 border border-white/10 p-6 text-sm text-white outline-none resize-none"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                inputRef.current = e.target.value;
              }}
              placeholder="相手の主張に反論しよう..."
            />
            <button
              onClick={() => {
                if (showConfirm) {
                  onChangeScreen();
                  nextRound();
                  return;
                }
                handleSendMessage(input);
              }}
              disabled={isAITyping}
              className="w-full rounded-2xl bg-white py-5 font-bold text-black hover:bg-gray-200 transition disabled:opacity-50"
            >
              {showConfirm ? "次のラウンドへ" : "確定"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



export default BattleScreen
