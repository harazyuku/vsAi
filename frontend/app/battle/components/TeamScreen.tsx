"use client";

import { Message } from "../page";

interface TeamScreenProps {
  round: number;
  teamMessages: Message[];
  input: string;
  onChangeInput: (value: string) => void;
  onSendTeamMessage: () => void;
  onConfirmTeamAction: () => void;
}

export default function TeamScreen({
  round,
  teamMessages,
  input,
  onChangeInput,
  onSendTeamMessage,
  onConfirmTeamAction,
}: TeamScreenProps) {
  return (
    <div className="relative z-10 w-[900px] h-[850px] flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
      {/* チーム画面 */}
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm text-gray-400">チームディスカッション</h1>
          <p className="text-xl font-semibold">
            意見をまとめて戦略を決めるフェーズ
          </p>
        </div>

        <div className="text-right text-sm text-gray-400">
          <p>ラウンド</p>
          <p className="text-white text-lg font-bold">{round}</p>
        </div>
      </div>

      {/* キャラ */}
      <div className="flex items-center justify-between gap-10">
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs text-gray-400">あなた</span>
          </div>
          <p className="text-sm text-gray-300">リーダー</p>
        </div>

        <div className="text-gray-500 text-sm">TEAM</div>

        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs text-gray-400">味方AI</span>
          </div>
          <p className="text-sm text-gray-300">サポートAI</p>
        </div>
      </div>

      {/* 意見ログ */}
      <div>
        <p className="text-sm text-gray-300 mb-2">意見まとめ</p>

        <div className="rounded-xl bg-black/20 p-4 overflow-y-auto h-[300px] flex flex-col">
          {teamMessages.map((m, i) => (
            <div
              key={i}
              className={`flex mb-3 ${
                m.role === "you" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words shadow-sm ${
                  m.role === "you"
                    ? "bg-white/10 text-white rounded-bl-sm backdrop-blur"
                    : "bg-blue-500 text-white rounded-br-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 入力 */}
      <div className="space-y-3">
        <textarea
          className="w-full h-28 rounded-xl bg-black/40 border border-white/10 p-4 text-sm text-white outline-none"
          placeholder="チームの方針をまとめる..."
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
        />

        <button
          className="w-full rounded-xl bg-white py-3 font-semibold text-black"
          onClick={onSendTeamMessage}
        >
          送信
        </button>
        <button
          className="w-full rounded-xl bg-white py-3 font-semibold text-black"
          onClick={onConfirmTeamAction}
        >
          方針を確定
        </button>
      </div>
    </div>
  );
}
