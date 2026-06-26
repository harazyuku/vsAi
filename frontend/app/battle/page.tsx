"use client";

import { useState, useRef, useEffect } from "react";
import Background from "./components/Background";
import TeamScreen from "./components/TeamScreen";
import BattleScreen from "./components/BattleScreen";
import JudgeScreen from "./components/JudgeScreen";

export type Message = {
  role: string;
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setinput] = useState("");
  const [round, setRound] = useState(1);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNextRound, setShowNextRound] = useState(false);
  const [phase, setPhase] = useState<"answer" | "reply">("answer");
  const [screen, setScreen] = useState<"team" | "battle" | "judge">("team");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [teamMessages, setTeamMessages] = useState<Message[]>([]);
  
  // ジャッジ用ステート
  const [isJudging, setIsJudging] = useState(false);
  const [judgeResult, setJudgeResult] = useState<any>(null);

  // ラウンド数処理
  const nextRound = () => {
    setRound((prev) => prev + 1);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typeText = (text: string) => {
    setTypingText("");
    setIsTyping(true);

    let i = 0;

    const interval = setInterval(() => {
      setTypingText(text.slice(0, i));
      i++;

      if (i > text.length) {
        clearInterval(interval);
        setIsTyping(false);

        setMessages((prev) => [
          ...prev,
          { role: "AI", content: text },
        ]);

        setPhase("reply");
      }
    }, 30);
  };

  // 意見の処理
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setinput("");

    // 人間側の意見
    setMessages((prev) => [
      ...prev,
      { role: "あなた", content: text },
    ]);

    // AI側の意見
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('API Error:', data.error);
      alert('AIの呼び出しに失敗しました: ' + data.details);
      return;
    }

    typeText(data.reply);
  };

  const sendTeamMessage = () => {
    if (!input.trim()) return;

    const text = input;
    setinput("");

    setTeamMessages((prev) => [
      ...prev,
      { role: "you", content: text },
    ]);
  };

  const handleTeamAction = () => {
    setShowNextRound(true);

    setTimeout(() => {
      setShowNextRound(false);

      // チーム → バトルへ
      setScreen("battle");
      setPhase("answer");
    }, 1200);
  };

  const handleBattleAction = async () => {
    if (phase === "answer") {
      sendMessage();
      return;
    }

    // 5ラウンド目のAIの反論後にボタンを押した場合
    if (round === 5) {
      setScreen("judge");
      setIsJudging(true);
      
      try {
        const response = await fetch("/api/judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
        const data = await response.json();
        setJudgeResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsJudging(false);
      }
      return;
    }

    setShowNextRound(true);

    setTimeout(() => {
      setShowNextRound(false);
      setScreen("team");
      setPhase("answer");
      nextRound();
    }, 1200);
  };

  const handleAction = () => {
    if (screen === "team") {
      handleTeamAction();
    } else {
      handleBattleAction();
    }
  };

  const resetGame = () => {
    setRound(1);
    setMessages([]);
    setTeamMessages([]);
    setScreen("team");
    setJudgeResult(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
      {/* 背景 */}
      <div className="fixed inset-0 z-0">
        <Background />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Next Round演出 */}
      {showNextRound && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
          <div className="text-5xl font-bold animate-pulse">
            {screen === "team" ? "TEAM PHASE" : "BATTLE PHASE"}
          </div>
          <div className="text-xl text-white/60 mt-4">
            第 {round} ラウンド
          </div>
        </div>
      )}

      {screen === "team" ? (
        <TeamScreen
          round={round}
          teamMessages={teamMessages}
          input={input}
          onChangeInput={setinput}
          onSendTeamMessage={sendTeamMessage}
          onConfirmTeamAction={handleAction}
        />
      ) : screen === "battle" ? (
        <BattleScreen
          round={round}
          messages={messages}
          input={input}
          onChangeInput={setinput}
          onSendMessage={handleAction}
          phase={phase}
          isTyping={isTyping}
          typingText={typingText}
          chatEndRef={chatEndRef}
        />
      ) : (
        <JudgeScreen 
          isLoading={isJudging} 
          result={judgeResult} 
          onReset={resetGame} 
        />
      )}
    </div>
  );
}