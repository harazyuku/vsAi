
import { useGameLogic } from '@/hooks/useGameLogic/useGameLogic';
import { useTimer } from '@/hooks/useTimer';
import React, { useEffect, useRef, useState } from 'react'
import BattleInputScreen from "../../BattleInputScreen";
import BattleAttackScreen from "../../BattleAttackScreen";
import BattleResponseScreen from "../../BattleResponseScreen";
import BattleCompactInput from "../../BattleCompactInput";

type Props = ReturnType<typeof useGameLogic> & {
  onChangeScreen: () => void;
  setShowRoundScreen: React.Dispatch<React.SetStateAction<boolean>>;
  isMultiplayer: boolean;
  sendSharedBattleMessage: (message: string, kind: "player" | "ai") => void;
  sendSharedBattleDraft?: (content: string) => void;
  sharedBattleDraft?: string;
  canSubmit?: boolean;
  playerDisplayName?: string;
  teamRoleLabel?: string;
  sharedBattleEvent?: {
    content: string;
    kind: "player" | "ai";
    createdAt: number;
    isOwn: boolean;
  } | null;
  onNextRoundRequest?: () => void;
  isNextRoundReady?: boolean;
  nextRoundReadyLabel?: string;
};

// チームロジック
function BaseBattleScreen({
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
  isMultiplayer,
  sendSharedBattleMessage,
  sendSharedBattleDraft,
  sharedBattleDraft = "",
  canSubmit = true,
  playerDisplayName = "あなた",
  teamRoleLabel,
  sharedBattleEvent,
  onNextRoundRequest,
  isNextRoundReady = false,
  nextRoundReadyLabel,
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

  const handleInputChange = (value: string) => {
    setInput(value);
    inputRef.current = value;
    if (isMultiplayer) sendSharedBattleDraft?.(value);
  };

  // 自分の発言〜aiが発言し画面に表示までのフロー
  const handleSendMessage = async (message: string) => {
    if (!canSubmit || !message.trim()) return;
    setShowInputScreen(false);
    setHasSubmitted(true);
    setAttackMessage(message);
    responseAddedRef.current = false;
    setInput("");
    inputRef.current = "";
    if (isMultiplayer) sendSharedBattleDraft?.("");
    stopBattleTimer();
    setIsAITyping(true);

    if (isMultiplayer) {
      sendSharedBattleMessage(message, "player");
    } else {
      sendBattleMessage(message);
    }

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
    if (!canSubmit) {
      void startBattleTimer();
      return;
    }

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

  useEffect(() => {
    if (!isMultiplayer || !sharedBattleEvent || sharedBattleEvent.isOwn) return;

    if (sharedBattleEvent.kind === "player") {
      setShowInputScreen(false);
      stopBattleTimer();
      responseAddedRef.current = false;
      setResponseMessage("");
      setAttackMessage(sharedBattleEvent.content);
      setIsAITyping(true);
      return;
    }

    responseAddedRef.current = true;
    setHasSubmitted(true);
    setResponseMessage(sharedBattleEvent.content);
    setIsAITyping(true);
  }, [isMultiplayer, sharedBattleEvent]);

  // メッセージが増えたらスクロール
  useEffect(() => {
    scrollTeamToBottom();
  }, [teamMessages]);

  useEffect(() => {
    scrollBattleToBottom();
  }, [battleMessages]);

  return (
   <div className="h-[100dvh] w-full overflow-hidden bg-transparent p-2 sm:p-4">
  {showInputScreen && (
    <BattleInputScreen
      value={canSubmit ? input : sharedBattleDraft}
      time={time}
      disabled={isAITyping}
      onChange={canSubmit ? handleInputChange : () => undefined}
      onSubmit={() => handleSendMessage(input)}
      onViewHistory={() => setShowInputScreen(false)}
      viewerMode={!canSubmit}
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
        if (isMultiplayer) {
          sendSharedBattleMessage(responseMessage, "ai");
        } else {
          sendAiBattleMessage(responseMessage);
        }
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
    `}
  >

    {/* ヘッダー */}
    <div className="flex shrink-0 items-start justify-between gap-3">

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-gray-400">
            {playerDisplayName}は
            <span className="text-white font-bold">
              「{stance}」
            </span>
            派
          </p>
          {teamRoleLabel && (
            <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black text-cyan-200">
              {teamRoleLabel}
            </span>
          )}
        </div>

        <h1 className="line-clamp-3 break-words text-base font-bold leading-snug sm:text-lg">
          {selectedTopic?.topic}
        </h1>
      </div>


      <div className="shrink-0 text-center">
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
                  m.role==="敵AI"
                  ? "bg-red-500/20 ml-auto"
                  : "bg-blue-500/20"
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
      {!hasSubmitted && !canSubmit ? (
        <button
          type="button"
          onClick={() => setShowInputScreen(true)}
          className="w-full rounded-2xl border border-cyan-300/25 bg-cyan-400/10 py-4 text-center font-black tracking-wider text-cyan-100 transition active:bg-cyan-400/15"
        >
          リーダーの入力画面を見る
        </button>
      ) : !hasSubmitted ? (
        <BattleCompactInput
          value={input}
          time={time}
          disabled={isAITyping}
          onChange={handleInputChange}
          onSubmit={() => handleSendMessage(input)}
          onExpand={() => setShowInputScreen(true)}
        />
      ) : (
        <button
          onClick={()=>{
            if (isMultiplayer) {
              onNextRoundRequest?.();
            } else {
              onChangeScreen();
              nextRound();
            }
          }}
          disabled={isAITyping || isNextRoundReady}
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
          {nextRoundReadyLabel ?? "次のラウンドへ"}
        </button>
      )}

    </div>


  </div>

</div>
  );
}



export default BaseBattleScreen
