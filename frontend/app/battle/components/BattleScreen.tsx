"use client";

import { RefObject } from "react";
import { Message } from "../page";

interface BattleScreenProps {
  round: number;
  messages: Message[];
  input: string;
  onChangeInput: (value: string) => void;
  onSendMessage: () => void;
  phase: "answer" | "reply";
  isTyping: boolean;
  typingText: string;
  chatEndRef: RefObject<HTMLDivElement | null>;
}

export default function BattleScreen({
  round,
  messages,
  input,
  onChangeInput,
  onSendMessage,
  phase,
  isTyping,
  typingText,
  chatEndRef,
}: BattleScreenProps) {
  return (
    <div className="relative z-10 w-[900px] h-[850px] flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
      {/* バトル画面 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm text-gray-400">お題</h1>
          <p className="text-xl font-semibold">学校で暴力は許されるべきか？</p>
        </div>

        <div className="text-right text-sm text-gray-400">
          <p>ラウンド</p>
          <p className="text-white text-lg font-bold">{round}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs text-gray-400">あなた</span>
          </div>
          <p className="text-sm text-gray-300">代表者</p>
        </div>

        <div className="text-gray-500 text-sm">VS</div>

        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs text-gray-400">AI</span>
          </div>
          <p className="text-sm text-gray-300">メスクソガキ</p>
        </div>
      </div>

      {/* 会話ログ */}
      <div>
        <p className="text-sm text-gray-300 mb-2">会話ログ</p>

        <div className="rounded-xl bg-black/20 p-4 overflow-y-auto h-[300px] flex flex-col">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex mb-3 ${
                m.role === "あなた" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words shadow-sm ${
                  m.role === "あなた"
                    ? "bg-white/10 text-white rounded-bl-sm backdrop-blur"
                    : "bg-green-500 text-white rounded-br-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-end mb-3">
              <div className="bg-green-500 text-white px-4 py-2 rounded-2xl text-sm">
                {typingText}
                <span className="animate-pulse">|</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* 入力欄 */}
      <div className="space-y-3">
        <textarea
          className="w-full h-28 rounded-xl bg-black/40 border border-white/10 p-4 text-sm text-white outline-none"
          placeholder="ここに意見を書く..."
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          disabled={phase === "reply"}
        />

        <button
          className="w-full rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-50"
          onClick={onSendMessage}
        >
          {phase === "answer" 
            ? "これで論破" 
            : round === 5 
              ? "最終判定へ" 
              : "確認"}
        </button>
      </div>
    </div>
  );
}
