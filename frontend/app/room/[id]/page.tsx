"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { useRealtimeGame } from "../../../hooks/useRealtimeGame";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  // 本来はAuthなどでIDを管理すべきだが、今回は暫定的にローカルストレージなどで永続化するIDを使用
  const [userId] = useState(() => {
    let id = localStorage.getItem("vsAi_userId");
    if (!id) {
      id = `user-${Math.random().toString(36).substr(2, 5)}`;
      localStorage.setItem("vsAi_userId", id);
    }
    return id;
  });

  const { roomData, toggleReady } = useRealtimeGame(roomId, userId);
  const [isReady, setIsReady] = useState(false);

  const me = roomData?.players.find(p => p.id === userId);
const opponent = roomData?.players.find(p => p.id !== userId);

console.log("RoomPage userId:", userId);
console.log("me:", me);

  

  const handleReadyClick = () => {
    const nextReady = !isReady;
    setIsReady(nextReady);
    toggleReady(nextReady);
  };

  if (!roomData) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Room...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center w-full max-w-md">
        <h1 className="text-3xl tracking-widest">REALTIME ROOM</h1>
        <p className="mt-2 text-white/50 text-sm">ID: {roomId}</p>

        {/* プレイヤー一覧表示 */}
        <div className="mt-10 flex justify-center gap-16">
          <div className="flex flex-col items-center">
            <FaUser size={50} className={me?.ready ? "text-green-400" : "text-white/60"} />
            <span className="text-xs mt-2">{me?.name || "あなた"}</span>
            <span className="text-xs text-white/50 mt-1">{me?.ready ? "READY!" : "準備中"}</span>
          </div>

          <div className="flex flex-col items-center">
            <FaUser size={50} className={opponent?.ready ? "text-green-400" : "text-white/60"} />
            <span className="text-xs mt-2">{opponent?.name || "対戦相手を探索中..."}</span>
            <span className="text-xs text-white/50 mt-1">{opponent ? (opponent.ready ? "READY!" : "準備中") : "---"}</span>
          </div>
        </div>

        {/* 準備完了ボタン */}
        {opponent && (
          <button
            onClick={handleReadyClick}
            className={`mt-12 w-full py-4 rounded-xl font-bold transition-all border ${
              isReady 
                ? "bg-green-600/20 border-green-500 text-green-300" 
                : "bg-white text-black border-white hover:bg-gray-200"
            }`}
          >
            {isReady ? "READY解除" : "準備完了！"}
          </button>
        )}
      </div>
    </div>
  );
}
