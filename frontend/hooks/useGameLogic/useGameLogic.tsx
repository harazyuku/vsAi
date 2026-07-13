import { useRef, useState } from "react";
import { aiCharacters, type AICharacter } from "@/app/config/aiConfig";
import { JudgeResult } from "@/app/battle/components/JudgeScreen";
import { topics, type Topic } from "@/app/config/aiConfig";

export const useGameLogic = () => {

  // メッセージの型定義
  type TeamMessage = {
    text: string;
    role: "あなた" | "味方AI";
    createdAt?: number;
  };

  type BattleMessage = {
    text: string;
    role: "あなた" | "敵AI";
    createdAt?: number;
  };

  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [battleMessages, setBattleMessages] = useState<BattleMessage[]>([]);

  const teamBottomRef = useRef<HTMLDivElement>(null);
  const battleBottomRef = useRef<HTMLDivElement>(null);

  const aiList = Object.values(aiCharacters);
  const topicList = Object.values(topics);
  const [stance, setStance] = useState("");
  const [aiStance, setAiStance] = useState("");
  const [selectedAI, setSelectedAI] = useState<AICharacter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // AIのタイピング演出、すでに表示済みのメッセージかどうかのstate
  const [typedMessageIds, setTypedMessageIds] = useState<number[]>([]);

  // ラウンド数
  const [round, setRound] = useState(1);

  // AI審判によるジャッジ
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);

  const sendAiTeamMessage = (message?: string) => {
    if (!message?.trim()) return;

    setTeamMessages(prev => [
      ...prev,
      {
        text: message,
        role: "味方AI"
      }
    ]);
  };

  // チームメッセージ保存
  const sendTeamMessage = (input: string) => {
    if (!input.trim()) return;

    setTeamMessages(prev => [
      ...prev,
      {
        text: input,
        role: "あなた"
      }
    ]);
  };

  // AIメッセージ保存
  const sendAiBattleMessage = (message: string) => {
    if (!message.trim()) return;

    setBattleMessages(prev => [
      ...prev,
      {
        text: message,
        role: "敵AI"
      }
    ]);
  };

  // バトルメッセージ保存
  const sendBattleMessage = (input: string) => {
    if (!input.trim()) return;

    setBattleMessages(prev => [
      ...prev,
      {
        text: input,
        role: "あなた"
      }
    ]);
  };

  // 制限時間内に送信できなかった場合
  const timeUpMessage = () => {
    return "意見なし";
  };



  // チームのチャット履歴を下までスクロール
  const scrollTeamToBottom = () => {
  const container = teamBottomRef.current?.parentElement;

  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

  // バトルのチャット履歴を下までスクロール
  const scrollBattleToBottom = () => {
  const container = battleBottomRef.current?.parentElement;

  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

  // 待つ処理
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // 対戦相手をランダムで決定
  const selectAi = () => {
    const randomIndex = Math.floor(Math.random() * aiList.length);
    return aiList[randomIndex];
  };

  // トピックをランダムで決定
  const selectTopic = () => {
    const randomIndex = Math.floor(Math.random() * topicList.length);
    return topicList[randomIndex];
  };

  // 反対か賛成かランダムに決める処理
  const selectStance = (topic: Topic) => {
    const randomIndex = Math.floor(Math.random() * topic.stances.length);
    return topic.stances[randomIndex];
  };

  // AI 反対か賛成か
  const selectAiStance = (topic: Topic, userStance: string) => {
    const aiSide = topic.stances.find(
      (stance) => stance !== userStance
    );
    if (!aiSide) {
      throw new Error("AIスタンスが決定できません");
    }
    setAiStance(aiSide);

    return aiSide;
  };

  // AI用プロンプトを作成
  const createBattlePrompt = (userMessage: string) => {
    if (!selectedAI || !selectedTopic) {
      throw new Error("AIまたはTopicが選択されていません");
    }

    return `
        ${selectedAI.persona}

        ${selectedTopic.instructionTemplate
        .replace("{topic}", selectedTopic.topic)
        .replace("{stance}", aiStance)
      }

ユーザーの意見:
${userMessage}

上記のユーザーの意見に対して、あなたの立場から反論してください。
`;
  };

  // AIに送信
  const sendAI = async (prompt: string) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    const data = await response.json();

    return data.reply;
  };


  // 味方AI
  // AI用プロンプトを作成
  const createAllyPrompt = (userMessage: string) => {
    if (!selectedTopic) {
      throw new Error("Topicが選択されていません");
    }

    return `
    あなたはユーザーの味方の元気なお姉さんです。
    ユーザーと同じ${stance}派の立場で、会話しながらディベートをサポートしてください。
    ただし、ユーザーの代わりに答えを作ったり、議論を主導したりしてはいけません。
    箇条書きではなく会話で進めてください。

    ${selectedTopic.instructionTemplate
        .replace("{topic}", selectedTopic.topic)
        .replace("{stance}", stance)
      }

    ユーザーの意見:
    ${userMessage}

    上記の意見について、
    ・主張を補強できるポイント
    ・不足している視点
    ・相手から反論された場合に考えられる対応

    を簡潔に助言してください。
    `;
  };

  const sendAllyAI = async (prompt: string) => {
    const response = await fetch("/api/gpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    const data = await response.json();

    return data.reply;
  };

  // ラウンドを進める処理
  const nextRound = () => {
    setRound(prev => prev + 1);
  };

  // ジャッジAI
  const judge = async () => {
    const response = await fetch("/api/judge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: battleMessages.map(m => ({
          role: m.role,
          content: m.text
        })),
      }),
    });

    const result = await response.json();
    setJudgeResult(result);
  };

  return {
    wait,

    // メッセージ
    teamMessages,
    sendTeamMessage,
    sendAiTeamMessage,
    battleMessages,
    sendBattleMessage,
    sendAiBattleMessage,
    timeUpMessage,

    // スクロール
    teamBottomRef,
    battleBottomRef,
    scrollTeamToBottom,
    scrollBattleToBottom,

    // aiConfig関連
    stance,
    setStance,
    aiStance,
    setAiStance,
    selectedAI,
    setSelectedAI,
    selectedTopic,
    setSelectedTopic,
    selectAi,
    selectTopic,
    selectStance,
    selectAiStance,
    aiList,
    topicList,
    createBattlePrompt,
    createAllyPrompt,
    sendAI,
    sendAllyAI,

    // Aiのタイピング演出
    typedMessageIds,
    setTypedMessageIds,

    // ラウンド
    nextRound,
    round,

    // AIのジャッジ
    judge,
    judgeResult,
  };
};