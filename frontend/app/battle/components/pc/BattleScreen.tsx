
import { useGameLogic } from '@/hooks/useGameLogic/useGameLogic';
import { useTimer } from '@/hooks/useTimer';
import React, { useEffect, useRef, useState } from 'react'
import BattleInputScreen from "../BattleInputScreen";
import BattleAttackScreen from "../BattleAttackScreen";
import BattleResponseScreen from "../BattleResponseScreen";
import BattleCompactInput from "../BattleCompactInput";

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

  nextRound,
  round,

  stance,
  selectedTopic,
}: Props) {
  const { time, startBattleTimer, stopBattleTimer } = useTimer();
  const [input, setInput] = useState("");
  const inputRef = useRef("");

  const [isAITyping, setIsAITyping] = useState(false);
  const [showInputScreen, setShowInputScreen] = useState(false);
  const [attackMessage, setAttackMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const responseAddedRef = useRef(false);

  // 自分の発言〜aiが発言し画面に表示までのフロー
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    setShowInputScreen(false);
    setHasSubmitted(true);
    setAttackMessage(message);
    responseAddedRef.current = false;
    setInput("");
    inputRef.current = "";
    stopBattleTimer();
    setIsAITyping(true);

    sendBattleMessage(message);

    const prompt = createBattlePrompt(message);

    try {
      const aiResponse = await sendAI(prompt);

      setResponseMessage(aiResponse);
    } catch {
      const fallbackResponse = "回答の生成に失敗した。だが、この勝負はまだ終わっていない。";
      setResponseMessage(fallbackResponse);
    }
  };

  // フロー
  const battleFlow = async () => {
   setShowRoundScreen(true);
    await wait(2200);
    setShowRoundScreen(false);
    setShowInputScreen(true);

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
      {showInputScreen && (
        <BattleInputScreen
          value={input}
          time={time}
          disabled={isAITyping}
          onChange={(value) => {
            setInput(value);
            inputRef.current = value;
          }}
          onSubmit={() => handleSendMessage(input)}
          onViewHistory={() => setShowInputScreen(false)}
        />
      )}
      {attackMessage && (
        <BattleAttackScreen
          message={attackMessage}
          onComplete={() => setAttackMessage("")}
        />
      )}
      {!attackMessage && isAITyping && selectedAI && (
        <BattleResponseScreen
          aiName={selectedAI.name}
          aiIcon={selectedAI.icon}
          message={responseMessage}
          onReveal={() => {
            if (responseAddedRef.current || !responseMessage) return;
            responseAddedRef.current = true;
            sendAiBattleMessage(responseMessage);
          }}
          onConfirm={() => {
            setResponseMessage("");
            setIsAITyping(false);
          }}
        />
      )}

      <div className="relative z-10 w-[1200px] min-h-[850px] rounded-3xl border border-white/10 bg-black/45 p-8 flex gap-8">
        {/* チーム履歴サイドバー */}
        <div className="w-[300px] border-r border-white/10 pr-8">
          <h3 className="text-base font-bold text-gray-300 mb-4">チームの戦略履歴</h3>
          <div className="space-y-3 h-[700px] overflow-y-auto">
            {teamMessages.length === 0 ? (
              <p className="text-white/50 text-base">チームの議論履歴はありません...</p>
            ) : (
              teamMessages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-base leading-relaxed ${m.role === "あなた" ? "bg-black/40" : "bg-black/60"
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
              <h1 className="text-xl text-gray-400">あなたは<span className='text-blue-500'>『{stance}』</span>派です</h1>
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
              {battleMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "あなた"
                      ? "justify-start"
                      : "justify-end"
                      }`}
                  >
                    <div
                      className={`max-w-[70%] px-5 py-4 rounded-2xl text-lg leading-relaxed ${m.role === "あなた"
                        ? "bg-blue-500/20 border border-blue-500/30 rounded-bl-none"
                        : "bg-red-500/20 border border-red-500/30 rounded-br-none"
                        }`}
                    >
                      <p className="text-sm mb-1 opacity-70">
                        {m.role}
                      </p>

                      <p>{m.text}</p>
                    </div>
                  </div>
              ))}
              <div ref={battleBottomRef} />
            </div>
          </div>

          {/* 入力欄 */}
          <div className="space-y-4">
            {!hasSubmitted ? (
              <BattleCompactInput
                value={input}
                time={time}
                disabled={isAITyping}
                onChange={(value) => {
                  setInput(value);
                  inputRef.current = value;
                }}
                onSubmit={() => handleSendMessage(input)}
                onExpand={() => setShowInputScreen(true)}
              />
            ) : (
              <button
                onClick={() => {
                  onChangeScreen();
                  nextRound();
                }}
                disabled={isAITyping}
                className="w-full rounded-2xl bg-blue-500/30 py-5 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0 disabled:opacity-50"
              >
                次のラウンドへ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



export default BattleScreen
