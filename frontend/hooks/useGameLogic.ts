import { useState, useRef, useEffect } from "react";
import { aiCharacters, AICharacter, topics } from "../app/config/aiConfig";

export type Message = {
  role: string;
  content: string;
  round: number;
};

export const useGameLogic = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setinput] = useState("");
  const [round, setRound] = useState(1);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showNextRound, setShowNextRound] = useState(false);
  const [phase, setPhase] = useState<"answer" | "reply">("answer");
  const [screen, setScreen] = useState<"team" | "battle" | "judge">("team");
  const [teamMessages, setTeamMessages] = useState<Message[]>([]);
  const [aiCharacter, setAiCharacter] = useState<AICharacter | null>(null);
  const [currentTopic, setCurrentTopic] = useState<{ topic: string; instructionTemplate: string; stance: string; background: "school" | "court" | "deathgame" } | null>(null);
  const [userStance, setUserStance] = useState<string | null>(null);
  const [isJudging, setIsJudging] = useState(false);
  const [judgeResult, setJudgeResult] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const charIds = Object.keys(aiCharacters);
    const randomCharId = charIds[Math.floor(Math.random() * charIds.length)];
    const character = aiCharacters[randomCharId];
    setAiCharacter(character);

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const aiStance = randomTopic.stances[Math.floor(Math.random() * randomTopic.stances.length)];
    
    const userStance = aiStance === randomTopic.stances[0] ? randomTopic.stances[1] : randomTopic.stances[0];
    
    setCurrentTopic({
      topic: randomTopic.topic,
      instructionTemplate: randomTopic.instructionTemplate.replace("{stance}", aiStance),
      stance: aiStance,
      background: randomTopic.background,
    });
    setUserStance(userStance);
  }, []);

  const nextRound = () => {
    setRound((prev) => prev + 1);
  };

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
        setMessages((prev) => [...prev, { role: "AI", content: text, round }]);
        setPhase("reply");
      }
    }, 30);
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentTopic) return;
    const text = input;
    setinput("");
    setMessages((prev) => [...prev, { role: "あなた", content: text, round }]);
    setIsThinking(true);
    try {
      const prompt = currentTopic.instructionTemplate.replace("{topic}", currentTopic.topic);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, prompt, persona: aiCharacter?.persona }),
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
    setTeamMessages((prev) => [...prev, { role: "you", content: text, round }]);
  };

  const handleAction = async () => {
    if (screen === "team") {
      setShowNextRound(true);
      setTimeout(() => {
        setShowNextRound(false);
        setScreen("battle");
        setPhase("answer");
      }, 1200);
    } else {
      if (phase === "answer") {
        sendMessage();
        return;
      }
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
        setScreen("team");
        setPhase("answer");
        nextRound();
      }, 1200);
    }
  };

  const resetGame = () => {
    setRound(1);
    setMessages([]);
    setTeamMessages([]);
    setScreen("team");
    setJudgeResult(null);
  };

  return {
    messages, input, setinput, round, typingText, isTyping, isThinking, showNextRound,
    phase, screen, chatEndRef, teamMessages, aiCharacter, currentTopic, userStance,
    isJudging, judgeResult, sendMessage, sendTeamMessage, handleAction, resetGame
  };
};
