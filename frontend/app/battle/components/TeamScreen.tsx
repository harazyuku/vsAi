"use client";

import { KeyboardEvent, useEffect, useRef } from "react";
import { Message } from "../../../hooks/useGameLogic";

interface TeamScreenProps {
  round: number;
  messages: Message[];
  teamMessages: Message[];
  input: string;
  onChangeInput: (value: string) => void;
  onSendTeamMessage: () => void;
  onConfirmTeamAction: () => void;
  topic: string;
  userStance: string;
}

export default function TeamScreen({
  round,
  messages,
  teamMessages,
  input,
  onChangeInput,
  onSendTeamMessage,
  onConfirmTeamAction,
  topic,
  userStance,
}: TeamScreenProps) {
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const teamScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (teamScrollRef.current) {
      teamScrollRef.current.scrollTop = teamScrollRef.current.scrollHeight;
    }
  }, [teamMessages]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (input.trim()) {
        onSendTeamMessage();
      }
    }
  };

  return (
    <div className="relative z-10 w-[1200px] min-h-[850px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 flex gap-8">
      {/* 左サイドバー：これまでのバトル履歴 */}
      <div className="w-[300px] border-r border-white/10 pr-8">
        <h3 className="text-sm font-bold text-gray-400 mb-4">バトル履歴</h3>
        <div ref={historyScrollRef} className="space-y-3 h-[700px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-white-500 text-sm">相手との履歴がここに表示されます...</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-sm ${
                  m.role === "あなた" ? "bg-blue-900/30" : "bg-green-900/30"
                }`}
              >
                <span className={`${m.role === "あなた" ? "text-blue-400" : "text-green-400"} font-bold block mb-1`}>
                  {m.role}
                </span>
                <p className="text-gray-200">{m.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col justify-between">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-sm text-gray-400">チームディスカッション</h1>
            <p className="text-2xl font-bold">{topic}</p>
            <p className="text-sm text-blue-400 font-bold mt-1">あなたの立場: {userStance}派</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">ROUND</p>
            <p className="text-5xl font-black">{round}</p>
          </div>
        </div>

        {/* 仲間とのチャット履歴 */}
        <div
          ref={teamScrollRef}
          className="bg-black/40 border border-white/10 rounded-2xl p-6 h-[400px] mb-8 overflow-y-auto space-y-4"
        >
          {teamMessages.length === 0 ? (
            <p className="text-bga-500 text-center mt-10">チームの会話がここに表示されます...</p>
          ) : (
            teamMessages.map((m, i) => {
              const isLatest = i === teamMessages.length - 1;
              return (
                <div key={i} className={`flex ${m.role === "you" ? "justify-start" : "justify-end"}`}>
                  <div className={`px-4 py-2 rounded-2xl ${isLatest ? "text-xl font-bold" : "text-sm"} ${m.role === "you" ? "bg-white text-black" : "bg-blue-600 text-white"}`}>
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 入力エリア */}
        <div className="space-y-4">
          <textarea
            className="w-full h-32 rounded-2xl bg-black/40 border border-white/10 p-6 text-sm text-white outline-none resize-none"
            placeholder="チームの方針をまとめる..."
            value={input}
            onChange={(e) => onChangeInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="grid grid-cols-2 gap-4">
            <button
              className="w-full rounded-2xl bg-white/10 py-5 font-bold text-white hover:bg-white/20 transition"
              onClick={onSendTeamMessage}
            >
              意見を追加
            </button>
            <button
              className="w-full rounded-2xl bg-white py-5 font-bold text-black hover:bg-gray-200 transition"
              onClick={onConfirmTeamAction}
            >
              方針を確定してバトルへ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
