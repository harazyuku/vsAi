
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
  const [historyTab, setHistoryTab] = useState<"team" | "battle">("battle");

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
   <div className="w-full h-screen overflow-hidden bg-black/20 p-4">

  <div
    className="
      w-full
      h-full
      rounded-3xl
      border border-white/10
      bg-white/5
      backdrop-blur-xl
      p-4
      flex
      flex-col
      gap-4
      overflow-hidden
    "
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

        <p className="text-xs text-gray-400">
          残り
        </p>

        <p className="text-xl font-black">
          {time}
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
        battleMessages.map((m,i)=>{

          const isTyped =
            typedMessageIds.includes(i);


          return (
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


              {
                m.role==="敵AI" && !isTyped
                ?
                <TypeAnimation
                  sequence={[
                    m.text,
                    ()=>{
                      setTypedMessageIds(prev=>[
                        ...prev,
                        i
                      ]);

                      setIsAITyping(false);
                      setShowConfirm(true);
                    }
                  ]}
                />
                :
                <p>
                  {m.text}
                </p>
              }


            </div>
          )

        })
      )}


      <div ref={battleBottomRef}/>

    </div>






    {/* 入力 */}
    <div className="shrink-0">

      <textarea
        value={input}
        onChange={(e)=>{
          setInput(e.target.value);
          inputRef.current=e.target.value;
        }}
        placeholder="相手の主張に反論しよう..."
        className="
          w-full
          h-24
          rounded-2xl
          bg-black/40
          p-4
          resize-none
        "
      />


      <button
        onClick={()=>{
          if(showConfirm){
            onChangeScreen();
            nextRound();
          }else{
            handleSendMessage(input);
          }
        }}
        disabled={isAITyping}
        className="
          w-full
          mt-3
          py-4
          rounded-xl
          bg-white
          text-black
          font-bold
        "
      >

        {showConfirm
          ? "確定"
          : "これで論破する"
        }

      </button>

    </div>


  </div>

</div>
  );
}



export default BattleScreen
