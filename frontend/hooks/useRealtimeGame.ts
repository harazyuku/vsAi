"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../app/providers/SocketProvider";
import { useRouter } from "next/navigation";

export interface Player {
  id: string;
  name: string;
  ready: boolean;
  stance: string;
}

export interface GameRoom {
  id: string;
  status: "ROOM_WAITING" | "BATTLE" | "JUDGING" | "FINISHED";
  players: Player[];
  currentRound: number;
  phase: "answer" | "reply";
  messages: Array<{ role: string; content: string; round: number }>;
  teamMessages: Array<{ role: string; content: string; round: number }>;
  timeLeft: number;
}

export const useRealtimeGame = (roomId?: string, userId?: string) => {
  const socket = useSocket();
  const router = useRouter();

  const [matchingStatus, setMatchingStatus] = useState<"idle" | "searching" | "matched">("idle");
  const [roomData, setRoomSync] = useState<GameRoom | null>(null);

  // ① マッチング開始
  const startMatching = (userId: string, userName: string) => {
  console.log("socket", socket);
  console.log("connected", socket?.connected);

  if (!socket) {
    console.log("socketがありません");
    return;
  }

  setMatchingStatus("searching");
  console.log("emit start-matching");
  socket.emit("start-matching", { userId, userName });
};

  // ② マッチングキャンセル
  const cancelMatching = (userId: string) => {
    if (!socket) return;
    socket.emit("cancel-matching", { userId });
    setMatchingStatus("idle");
  };

  // ③ 準備状態のトグル送信
  const toggleReady = (ready: boolean) => {
    if (!socket || !roomId || !userId) return;
    socket.emit("toggle-ready", { roomId, userId, ready });
  };

  // ④ 対戦メッセージ送信
  const submitMessage = (content: string) => {
    if (!socket || !roomId || !userId) return;
    socket.emit("submit-debate-message", { roomId, userId, content });
  };

  useEffect(() => {
    if (!socket) return;

    // A. マッチング成功
    // A. マッチング成功
socket.on("match-success", ({ roomId }) => {
  console.log("🎉 match-success受信", roomId);

  setMatchingStatus("matched");
  router.push(`/room/${roomId}`);
});

    // B. ルームデータの常時同期
    socket.on("room-sync", (data: GameRoom) => {
  console.log("room-sync", data.status, data.players);

  setRoomSync(data);

  if (data.status === "BATTLE") {
    console.log("🚀 BATTLEへ遷移");
    router.push(`/battle?roomId=${data.id}`);
  }
});

    // C. 対戦相手が切断した場合の処理
    socket.on("player-disconnected", ({ userId: disconnectedUserId }) => {
      alert("対戦相手が退出しました。");
      router.push("/match");
    });

    // 画面直接ロード時に既存ルームに参加
    if (roomId && userId) {
      socket.emit("join-game-room", { roomId, userId });
    }

    return () => {
      socket.off("match-success");
      socket.off("room-sync");
      socket.off("player-disconnected");
    };
  }, [socket, roomId, userId, router]);

  return {
    matchingStatus,
    roomData,
    startMatching,
    cancelMatching,
    toggleReady,
    submitMessage
  };
};

