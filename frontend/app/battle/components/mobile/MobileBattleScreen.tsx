
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
  const [historyTab, setHistoryTab] = useState<"team" | "battle">("battle");

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
   <div className="w-full h-screen overflow-hidden bg-black/20 p-4">
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

  <div
    className={`
      w-full
      h-full
      rounded-3xl
      border border-white/10
      bg-black/45
      p-4
      flex
      flex-col
      gap-4
      overflow-hidden
    `}
  >

    {/* ヘッダー */}
    <div className="flex justify-between shrink-0">

      <div>
        <p className="text-sm text-gray-400">
          あなたは
          <span className="text-white font-bold">
            「{stance}」
          </span>
          派
        </p>

        <h1 className="text-lg font-bold">
          {selectedTopic?.topic}
        </h1>
      </div>


      <div className="text-center">
        <p className="text-xs text-gray-400">
          ROUND
        </p>

        <p className="text-3xl font-black">
          {round}
        </p>

      </div>

    </div>





    {/* タブ */}
    <div
      className="
        grid
        grid-cols-2
        rounded-xl
        overflow-hidden
        bg-black/40
        shrink-0
      "
    >

      <button
        onClick={()=>setHistoryTab("team")}
        className={`
          py-3
          ${
            historyTab==="team"
            ? "bg-white text-black font-bold"
            : ""
          }
        `}
      >
        チーム履歴
      </button>


      <button
        onClick={()=>setHistoryTab("battle")}
        className={`
          py-3
          ${
            historyTab==="battle"
            ? "bg-white text-black font-bold"
            : ""
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
        p-4
        space-y-4
      "
    >

      {historyTab==="team" && (
        teamMessages.map((m,i)=>(
          <div
            key={i}
            className={`
              max-w-[85%]
              p-4
              rounded-2xl
              ${
                m.role==="あなた"
                ? "bg-white text-black"
                : "bg-white/10 ml-auto"
              }
            `}
          >

            <p className="text-xs opacity-50">
              {m.role}
            </p>

            {m.text}

          </div>
        ))
      )}



      {historyTab==="battle" && (
        battleMessages.map((m,i)=>(
            <div
              key={i}
              className={`
                max-w-[85%]
                p-4
                rounded-2xl
                ${
                  m.role==="あなた"
                  ? "bg-blue-500/20"
                  : "bg-red-500/20 ml-auto"
                }
              `}
            >

              <p className="text-xs opacity-50">
                {m.role}
              </p>

              <p>{m.text}</p>
            </div>
        ))
      )}


      <div ref={battleBottomRef}/>

    </div>






    {/* 入力 */}
    <div className="shrink-0">
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
          onClick={()=>{
            onChangeScreen();
            nextRound();
          }}
          disabled={isAITyping}
          className="
            w-full
            mt-3
            py-4
            rounded-xl
            bg-blue-500/30
            text-white
            font-bold
            transition-all duration-200
            hover:-translate-y-1 hover:bg-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20
            active:translate-y-0
            disabled:opacity-50
          "
        >
          次のラウンドへ
        </button>
      )}

    </div>


  </div>

</div>
  );
}



export default BattleScreen
