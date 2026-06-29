"use client";

import { useState, useRef, useEffect } from "react";
import Background from "./components/Background";
import TeamScreen from "./components/TeamScreen";
import BattleScreen from "./components/BattleScreen";
import JudgeScreen from "./components/JudgeScreen";
import { aiCharacters, AICharacter, topics } from "../config/aiConfig";

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
  const [isThinking, setIsThinking] = useState(false);
  const [showNextRound, setShowNextRound] = useState(false);
  const [phase, setPhase] = useState<"answer" | "reply">("answer");
  const [screen, setScreen] = useState<"team" | "battle" | "judge">("team");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [teamMessages, setTeamMessages] = useState<Message[]>([]);
  
  // ゲーム設定ステート
  const [aiCharacter, setAiCharacter] = useState<AICharacter | null>(null);
  const [currentTopic, setCurrentTopic] = useState<{ topic: string; instructionTemplate: string; stance: string } | null>(null);
  const [userStance, setUserStance] = useState<string | null>(null);

  // ジャッジ用ステート
  const [isJudging, setIsJudging] = useState(false);
  const [judgeResult, setJudgeResult] = useState<any>(null);

  // ゲームの初期設定
  useEffect(() => {
    const charIds = Object.keys(aiCharacters);
    const randomCharId = charIds[Math.floor(Math.random() * charIds.length)];
    const character = aiCharacters[randomCharId];
    setAiCharacter(character);

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const aiStance = randomTopic.stances[Math.floor(Math.random() * randomTopic.stances.length)];
    
    // ユーザーはAIと逆の立場にする
    const userStance = aiStance === randomTopic.stances[0] ? randomTopic.stances[1] : randomTopic.stances[0];
    
    setCurrentTopic({
      topic: randomTopic.topic,
      instructionTemplate: randomTopic.instructionTemplate.replace("{stance}", aiStance),
      stance: aiStance,
    });
    setUserStance(userStance);
  }, []);

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
    if (!input.trim() || !currentTopic) return;

    const text = input;
    setinput("");

    // 人間側の意見
    setMessages((prev) => [
      ...prev,
      { role: "あなた", content: text },
    ]);

    setIsThinking(true);

    try {
      // AI側の意見
      const prompt = currentTopic.instructionTemplate.replace("{topic}", currentTopic.topic);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text,
          prompt: prompt, // プロンプトを渡すようにする
          persona: aiCharacter?.persona
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('API Error:', data.error);
        alert('AIの呼び出しに失敗しました: ' + data.details);
        setIsThinking(false);
        return;
      }

      setIsThinking(false);
      typeText(data.reply);
    } catch (error) {
      console.error('Fetch Error:', error);
      setIsThinking(false);
    }
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
          body: JSON.stringify({ messages, topic: currentTopic?.topic }),
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
      setMessages([]); // バトル画面のメッセージ履歴をクリア
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
    // 初期設定を再ランダム化
    // ... (初期化ロジック)
  };

  if (!aiCharacter || !currentTopic) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <div className="text-4xl font-black tracking-widest animate-pulse text-white">
          NOW LOADING...
        </div>
        <div className="w-16 h-1 bg-white/20 mx-auto rounded-full overflow-hidden">
          <div className="h-full bg-white animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );

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
          messages={messages}
          teamMessages={teamMessages}
          input={input}
          onChangeInput={setinput}
          onSendTeamMessage={sendTeamMessage}
          onConfirmTeamAction={handleAction}
          topic={currentTopic.topic}
          userStance={userStance!}
        />
      ) : screen === "battle" ? (
        <BattleScreen
          round={round}
          messages={messages}
          teamMessages={teamMessages}
          input={input}
          onChangeInput={setinput}
          onSendMessage={handleAction}
          phase={phase}
          isTyping={isTyping}
          typingText={typingText}
          isThinking={isThinking}
          chatEndRef={chatEndRef}
          topic={currentTopic.topic}
          userStance={userStance!}
          aiCharacter={aiCharacter!}
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