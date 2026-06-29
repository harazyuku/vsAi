"use client";

import { RefObject, KeyboardEvent } from "react";
import { Message } from "../page";
import { MdBalance } from "react-icons/md";

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
}: BattleScreenProps) {
  const myLatestMessage =
    messages
      .filter((m) => m.role === "あなた")
      .at(-1)?.content || "まだ発言していません";

  const aiLatestMessage = isThinking
    ? "考え中..."
    : isTyping
    ? typingText
    : messages.filter((m) => m.role === "AI").at(-1)?.content ||
      "まだ発言していません";

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (!(isTyping || isThinking || (phase === "answer" && !input.trim()))) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="relative z-10 w-[1200px] min-h-[850px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 flex flex-col gap-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">バトルフェーズ</p>
          <h1 className="text-3xl font-bold">
            学校で暴力は許されるべきか？
          </h1>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">ROUND</p>
          <p className="text-5xl font-black">{round}</p>
        </div>
      </div>

      {/* 中心アイコン */}
      <div className="relative flex-1 grid grid-cols-2 gap-8">

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
    <MdBalance size={150} />
        </div>

        {/* 自分 */}
        <div className="relative rounded-3xl border border-blue-500/30 bg-blue-500/10 p-8 overflow-hidden">
          <div className="mb-8">
            <p className="text-blue-300 text-sm">
              あなたの意見
            </p>

            <h2 className="text-2xl font-bold">
              👤 あなた
            </h2>
          </div>

          <div className="h-[350px] overflow-y-auto">
            <p className="text-2xl leading-relaxed font-bold break-words">
              {myLatestMessage}
            </p>
          </div>
        </div>

        {/* AI */}
        <div className="relative rounded-3xl border border-red-500/30 bg-red-500/10 p-8 overflow-hidden">
          <div className="mb-8 text-right">
            <p className="text-red-300 text-sm">
              相手の意見
            </p>

            <h2 className="text-2xl font-bold">
              🤖 メスクソガキ
            </h2>
          </div>

          <div className="h-[350px] overflow-y-auto">
            <p className="text-2xl leading-relaxed font-bold text-left break-words">
              {aiLatestMessage}

              {(isTyping || isThinking) && (
                <span className="animate-pulse">|</span>
              )}
            </p>
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
          {isThinking 
            ? "考え中..." 
            : phase === "answer"
            ? "これで論破する"
            : round === 5
            ? "最終判定へ"
            : "次のラウンドへ"}
        </button>
      </div>
    </div>
  );
}