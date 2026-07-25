"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";
import { useSocket } from "@/app/providers/SocketProvider";

type RoomPlayer = {
  id: string;
  name: string;
  ready: boolean;
  role: "member";
};

type RoomData = {
  id: string;
  status: "ROOM_WAITING" | "STARTING" | "STORY" | "BATTLE" | "JUDGING";
  players: RoomPlayer[];
};

type MatchPlayer = {
  userId: string;
  userName: string;
};

type SharedGameSelection = {
  aiId: string;
  topicBackground: "school" | "court" | "deathgame";
  stanceIndex: number;
  leaderUserId: string;
  leaderUserName: string;
  teamSize: number;
};

export default function RoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = params.id;
  const { socket, isConnected } = useSocket();
  const [player, setPlayer] = useState<MatchPlayer | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [hasDisconnected, setHasDisconnected] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const storedPlayer = window.sessionStorage.getItem("vsAi_matchPlayer");
    if (!storedPlayer) {
      router.replace("/matching");
      return;
    }

    try {
      // sessionStorageはブラウザでのみ利用できるためマウント後に復元する。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayer(JSON.parse(storedPlayer) as MatchPlayer);
    } catch {
      router.replace("/matching");
    }
  }, [router]);

  useEffect(() => {
    if (!socket || !isConnected || !player) return;

    const handleRoomSync = (room: RoomData | null) => {
      if (room?.id === roomId) {
        if (room.status === "STARTING") {
          setCountdown(5);
        }
        setRoomData(room);
      }
    };
    const handlePlayerDisconnected = () => setHasDisconnected(true);
    const handleGameStart = (selection: SharedGameSelection) => {
      window.sessionStorage.setItem("vsAi_activeRoom", roomId);
      window.sessionStorage.setItem(
        "vsAi_sharedGame",
        JSON.stringify(selection),
      );
      router.replace("/battle/story");
    };

    socket.on("room-sync", handleRoomSync);
    socket.on("player-disconnected", handlePlayerDisconnected);
    socket.on("game-start", handleGameStart);
    socket.emit("join-game-room", {
      roomId,
      userId: player.userId,
    });

    return () => {
      socket.off("room-sync", handleRoomSync);
      socket.off("player-disconnected", handlePlayerDisconnected);
      socket.off("game-start", handleGameStart);
    };
  }, [isConnected, player, roomId, router, socket]);

  useEffect(() => {
    if (roomData?.status !== "STARTING") {
      return;
    }

    const interval = window.setInterval(() => {
      setCountdown((current) => Math.max(1, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [roomData?.status]);

  const me = useMemo(
    () => roomData?.players.find((roomPlayer) => roomPlayer.id === player?.userId),
    [player?.userId, roomData],
  );
  const collaborators = useMemo(
    () => roomData?.players.filter((roomPlayer) => roomPlayer.id !== player?.userId),
    [player?.userId, roomData],
  );

  const toggleReady = () => {
    if (!socket || !player || !roomData) return;

    socket.emit("toggle-ready", {
      roomId,
      userId: player.userId,
      ready: !me?.ready,
    });
  };

  if (!player || !roomData) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-white/15 border-t-cyan-300" />
          <p className="mt-5 font-bold text-white/65">
            {isConnected ? "ルームへ入室しています…" : "サーバーへ接続しています…"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black px-4 py-8 text-white">
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <section className="relative z-10 w-full max-w-5xl rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-center backdrop-blur-xl sm:p-10">
        <p className="text-xs font-black tracking-[0.35em] text-cyan-300/70">
          REALTIME ROOM
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">
          {roomData.status === "STARTING" ? "チーム準備完了！" : "チーム結成"}
        </h1>
        <p className="mt-2 break-all text-xs text-white/35">ROOM: {roomId}</p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <PlayerCard label="あなた" player={me} color="blue" />
          {collaborators?.map((collaborator, index) => (
            <PlayerCard
              key={collaborator.id}
              label={`協力者 ${index + 1}`}
              player={collaborator}
              color="red"
            />
          ))}
        </div>

        {hasDisconnected ? (
          <div className="mt-10">
            <p className="font-bold text-red-300">協力者との接続が切れました</p>
            <button
              type="button"
              onClick={() => router.replace("/matching")}
              className="mt-5 rounded-xl bg-white px-7 py-3 font-black text-black"
            >
              再マッチング
            </button>
          </div>
        ) : roomData.status === "STARTING" ? (
          <div className="zoom-slash mt-10 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-5 py-5">
            <p className="text-xl font-black text-emerald-200 sm:text-2xl">
              {countdown}秒後にゲームを開始
            </p>
            <p className="mt-2 text-sm text-white/55">
              全員同じシチュエーションと敵AIで戦います
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggleReady}
            disabled={!collaborators?.length}
            className={`mt-10 w-full max-w-sm rounded-2xl border px-6 py-4 font-black transition disabled:cursor-not-allowed disabled:opacity-35 ${
              me?.ready
                ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200"
                : "border-white bg-white text-black hover:scale-[1.02]"
            }`}
          >
            {me?.ready ? "READY解除" : "準備完了！"}
          </button>
        )}
      </section>
    </main>
  );
}

function PlayerCard({
  label,
  player,
  color,
}: {
  label: string;
  player?: RoomPlayer;
  color: "blue" | "red";
}) {
  const colorClass =
    color === "blue"
      ? "border-blue-300/30 bg-blue-400/10 text-blue-200"
      : "border-red-300/30 bg-red-400/10 text-red-200";

  return (
    <div className={`rounded-2xl border p-4 sm:p-7 ${colorClass}`}>
      <FaUser
        className={`mx-auto text-4xl sm:text-6xl ${
          player?.ready ? "text-emerald-300" : "text-current"
        }`}
      />
      <p className="mt-4 text-xs font-bold text-white/45">{label}</p>
      <p className="mt-1 truncate font-black sm:text-xl">
        {player?.name ?? "入室待ち"}
      </p>
      <p
        className={`mt-3 text-xs font-black tracking-wider ${
          player?.ready ? "text-emerald-300" : "text-white/35"
        }`}
      >
        {player?.ready ? "READY!" : player ? "準備中" : "---"}
      </p>
    </div>
  );
}
