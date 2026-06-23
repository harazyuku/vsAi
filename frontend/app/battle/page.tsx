"use client";

import { useState, useRef, useEffect } from "react";
import Background from "./components/Background";

type Message = {
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

  const [screen, setScreen] = useState<"team" | "battle">("team");

  const chatEndRef = useRef<HTMLDivElement>(null);

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

    typeText(data.reply);
  };

const handleAction = () => {
  if (screen === "team") {
    handleTeamAction();
    return;
  }

  handleBattleAction();
};

const handleTeamAction = () => {
  setShowNextRound(true);

  setTimeout(() => {
    setShowNextRound(false);

    // チーム → バトルへ
    setScreen("battle");
    setPhase("answer");
    nextRound();
  }, 1200);
};

const handleBattleAction = () => {
  if (phase === "answer") {
    sendMessage();
    return;
  }

  setShowNextRound(true);

  setTimeout(() => {
    setShowNextRound(false);

    // バトル → チームへ戻すとかも可
    setScreen("team");
    setPhase("answer");
    nextRound();
  }, 1200);
};

    // 味方画面とバトル画面チェンジ
    const changeScreen = () => {
      setScreen((prev) => (prev === "battle" ? "team" : "battle"));
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
      第 {round + 1} ラウンド
    </div>
  </div>
)}

      {screen === "team" ? (
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

              <div className="flex mb-3 justify-start">
                <div className="max-w-[70%] px-4 py-2 rounded-2xl text-sm bg-white/10 text-white">
                  あなた：まずは反対寄りで攻めるべきだと思う
                </div>
              </div>

              <div className="flex mb-3 justify-end">
                <div className="max-w-[70%] px-4 py-2 rounded-2xl text-sm bg-white/10 text-white">
                  AI：賛成側の論点を潰した方が勝ちやすい
                </div>
              </div>

            </div>
          </div>

          {/* 入力 */}
          <div className="space-y-3">
            <textarea
              className="w-full h-28 rounded-xl bg-black/40 border border-white/10 p-4 text-sm text-white outline-none"
              placeholder="チームの方針をまとめる..."
            />

            <button className="w-full rounded-xl bg-white py-3 font-semibold text-black"
            onClick={handleAction}>
              方針を確定
            </button>
          </div>

        </div>
      ) : (
        <div className="relative z-10 w-[900px] h-[850px] flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

          {/* バトル画面 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm text-gray-400">お題</h1>
              <p className="text-xl font-semibold">
                学校で暴力は許されるべきか？
              </p>
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

          {/* バトルログは今のままでOK */}
          
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
              onChange={(e) => setinput(e.target.value)}
              disabled={phase === "reply"}
            />

            <button
              className="w-full rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-50"
              onClick={handleAction}
            >
              {phase === "answer" ? "これで論破" : "確認"}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}