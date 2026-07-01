"use client";

import { KeyboardEvent, useEffect, useRef } from "react";
import { Message } from "../../../hooks/useGameLogic";
import { socket } from "../../../lib/socket";

interface TeamScreenProps {
  round: number;
  messages: Message[];
  teamMessages: Message[];
  input: string;
  onChangeInput: (value: string) => void;
  onSendTeamMessage: (msg: Message) => void;
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

  const roomId = "room-1";
  const userId = "user-1";

  useEffect(() => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollTop =
        historyScrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (teamScrollRef.current) {
      teamScrollRef.current.scrollTop =
        teamScrollRef.current.scrollHeight;
    }
  }, [teamMessages]);

  // 受信（これが本体）
  useEffect(() => {
    const handler = (msg: Message) => {
      onSendTeamMessage(msg);
    };

    socket.on("team-message", handler);

    return () => {
      socket.off("team-message", handler);
    };
  }, [onSendTeamMessage]);

  // 送信
  const send = () => {
    if (!input.trim()) return;

    socket.emit("team-message", {
      roomId,
      userId,
      content: input,
    });

    onChangeInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      send();
    }
  };

  return (
    <div className="relative z-10 w-[1200px] min-h-[850px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 flex gap-8">

      {/* 左 */}
      <div className="w-[300px] border-r border-white/10 pr-8">
        <h3 className="text-sm font-bold text-gray-400 mb-4">バトル履歴</h3>
        <div ref={historyScrollRef} className="space-y-3 h-[700px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className="p-3 rounded-xl text-sm bg-white/5">
              <span className="font-bold block mb-1 text-gray-300">
                {m.name}
              </span>
              <p className="text-gray-200">{m.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* メイン */}
      <div className="flex-1 flex flex-col justify-between">

        <div className="mb-8">
          <p className="text-sm text-gray-400">チームディスカッション</p>
          <p className="text-2xl font-bold">{topic}</p>
          <p className="text-sm text-blue-400 mt-1">
            あなたの立場: {userStance}
          </p>
        </div>

        {/* チャット */}
        <div
          ref={teamScrollRef}
          className="bg-black/40 border border-white/10 rounded-2xl p-6 h-[400px] mb-8 overflow-y-auto space-y-4"
        >
          {teamMessages.map((m, i) => (
            <div key={i} className="flex">
              <div className="px-4 py-2 rounded-2xl bg-white text-black">
                <div className="text-xs opacity-60">{m.name}</div>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* 入力 */}
        <div>
          <textarea
            className="w-full h-32 rounded-2xl bg-black/40 border border-white/10 p-6 text-sm text-white"
            value={input}
            onChange={(e) => onChangeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="チームの方針をまとめる..."
          />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              className="bg-white/10 py-4 rounded-xl"
              onClick={send}
            >
              送信
            </button>

            <button
              className="bg-white text-black py-4 rounded-xl"
              onClick={onConfirmTeamAction}
            >
              確定
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}