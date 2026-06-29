"use client";

import { RefObject, KeyboardEvent, useEffect, useRef } from "react";
import { Message } from "../page";
import { MdBalance } from "react-icons/md";
import { AICharacter } from "../../config/aiConfig";

interface BattleScreenProps {
  round: number;
  messages: Message[];
  teamMessages: Message[];
  input: string;
  onChangeInput: (value: string) => void;
  onSendMessage: () => void;
  phase: "answer" | "reply";
  isTyping: boolean;
  typingText: string;
  isThinking: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  topic: string;
  userStance: string;
  aiCharacter: AICharacter;
}

export default function BattleScreen({
  round,
  messages,
  teamMessages,
  input,
  onChangeInput,
  onSendMessage,
  phase,
  isTyping,
  typingText,
  isThinking,
  topic,
  userStance,
  aiCharacter,
}: BattleScreenProps) {
  const teamHistoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (teamHistoryScrollRef.current) {
      teamHistoryScrollRef.current.scrollTop = teamHistoryScrollRef.current.scrollHeight;
    }
  }, [teamMessages]);

  const myLatestMessage = messages
    .filter((m) => m.role === "あなた")
    .at(-1)?.content;

  const aiLatestMessage = isThinking
    ? "考え中..."
    : isTyping
    ? typingText
    : messages.filter((m) => m.role === "AI").at(-1)?.content;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (!(isTyping || isThinking || (phase === "answer" && !input.trim()))) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="relative z-10 w-[1200px] min-h-[850px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 flex gap-8">
      {/* チーム履歴サイドバー */}
      <div className="w-[300px] border-r border-white/10 pr-8">
        <h3 className="text-sm font-bold text-gray-400 mb-4">チームの戦略履歴</h3>
        <div ref={teamHistoryScrollRef} className="space-y-3 h-[700px] overflow-y-auto">
          {teamMessages.length === 0 ? (
            <p className="text-white/50 text-sm">チームの議論履歴はありません...</p>
          ) : (
            teamMessages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-sm ${
                  m.role === "you" ? "bg-black/40" : "bg-black/60"
                }`}
              >
                <span className={`${m.role === "you" ? "text-blue-400" : "text-blue-200"} font-bold block mb-1`}>
                  {m.role === "you" ? "あなた" : "仲間"}
                </span>
                <p className="text-gray-200">{m.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">バトルフェーズ</p>
            <h1 className="text-2xl font-bold">{topic}</h1>
            <p className="text-sm text-blue-400 font-bold mt-1">あなたの立場: {userStance}派</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">ROUND</p>
            <p className="text-5xl font-black">{round}</p>
          </div>
        </div>

        {/* 中心アイコン */}
        <div className="relative flex-1 grid grid-cols-2 gap-8">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <MdBalance size={120} className="text-white/20" />
          </div>

          {/* 自分 */}
          <div className="relative rounded-3xl border border-blue-500/30 bg-blue-500/10 p-8 overflow-hidden">
            <div className="mb-8">
              <p className="text-blue-300 text-sm">チーム人類の意見</p>
              <h2 className="text-2xl font-bold">👤 あなた</h2>
            </div>
            <div className="h-[350px] overflow-y-auto">
              {myLatestMessage ? (
                <p className="text-2xl leading-relaxed font-bold break-words">{myLatestMessage}</p>
              ) : (
                <p className="text-sm text-white/50">まだ発言していません</p>
              )}
            </div>
          </div>

          {/* AI */}
          <div className="relative rounded-3xl border border-red-500/30 bg-red-500/10 p-8 overflow-hidden">
            <div className="mb-8 text-right">
              <p className="text-red-300 text-sm">相手の意見</p>
              <h2 className="text-2xl font-bold flex items-center justify-end gap-3">
                {aiCharacter.name}
                <img src={aiCharacter.icon} alt={aiCharacter.name} className="w-12 h-12 rounded-full object-cover" />
              </h2>
            </div>
            <div className="h-[350px] overflow-y-auto">
              {aiLatestMessage ? (
                <p className="text-2xl leading-relaxed font-bold text-left break-words">
                  {aiLatestMessage}
                  {(isTyping || isThinking) && <span className="animate-pulse">|</span>}
                </p>
              ) : (
                <p className="text-sm text-white/50 text-left">まだ発言していません</p>
              )}
            </div>
          </div>
        </div>

        {/* 入力欄 */}
        <div className="space-y-4">
          <textarea
            className="w-full h-32 rounded-2xl bg-black/40 border border-white/10 p-6 text-sm text-white outline-none resize-none"
            placeholder="相手の主張に反論しよう..."
            value={input}
            onChange={(e) => onChangeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={phase === "reply" || isTyping || isThinking}
          />
          <button
            onClick={onSendMessage}
            disabled={isTyping || isThinking || (phase === "answer" && !input.trim())}
            className="w-full rounded-2xl bg-white py-5 font-bold text-black hover:bg-gray-200 transition disabled:opacity-50"
          >
            {isThinking ? "考え中..." : phase === "answer" ? "これで論破する" : round === 5 ? "最終判定へ" : "次のラウンドへ"}
          </button>
        </div>
      </div>
    </div>
  );
}
