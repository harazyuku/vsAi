"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/app/providers/SocketProvider";

type MatchingStatus = "connecting" | "waiting" | "matched" | "error";

function getOrCreatePlayer() {
  const storedName = window.localStorage.getItem("vsAi_userName");
  const userId = `user-${crypto.randomUUID().replaceAll("-", "").slice(0, 10)}`;
  const userName =
    storedName ?? `挑戦者${Math.floor(1000 + Math.random() * 9000)}`;

  window.localStorage.setItem("vsAi_userName", userName);
  window.sessionStorage.setItem(
    "vsAi_matchPlayer",
    JSON.stringify({ userId, userName }),
  );

  return { userId, userName };
}

export default function MatchingPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [status, setStatus] = useState<MatchingStatus>("connecting");
  const [userName, setUserName] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [matchDeadline, setMatchDeadline] = useState<number | null>(null);
  const [matchSecondsLeft, setMatchSecondsLeft] = useState<number | null>(null);
  const playerRef = useRef<{ userId: string; userName: string } | null>(null);
  const hasStartedRef = useRef(false);

  const startMatching = useCallback(() => {
    if (!socket?.connected || !playerRef.current) return;

    hasStartedRef.current = true;
    setStatus("waiting");
    socket.emit("start-matching", playerRef.current);
  }, [socket]);

  useEffect(() => {
    const player = getOrCreatePlayer();
    playerRef.current = player;
    // localStorageはブラウザでのみ利用できるため、マウント後に表示名を反映する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(player.userName);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleWaiting = ({
      playerCount: waitingPlayers = 1,
      matchDeadline: deadline = null,
    }: {
      playerCount?: number;
      matchDeadline?: number | null;
    }) => {
      setPlayerCount(waitingPlayers);
      setMatchDeadline(deadline);
      setMatchSecondsLeft(
        deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) : null,
      );
      setStatus("waiting");
    };
    const handleSuccess = ({
      roomId,
      memberCount,
    }: {
      roomId: string;
      memberCount: number;
    }) => {
      setPlayerCount(memberCount);
      setMatchDeadline(null);
      setMatchSecondsLeft(null);
      setStatus("matched");
      window.setTimeout(() => router.push(`/room/${roomId}`), 700);
    };
    const handleConnectError = () => setStatus("error");

    socket.on("matching-status", handleWaiting);
    socket.on("match-success", handleSuccess);
    socket.on("connect_error", handleConnectError);

    if (isConnected && !hasStartedRef.current) {
      startMatching();
    }

    return () => {
      socket.off("matching-status", handleWaiting);
      socket.off("match-success", handleSuccess);
      socket.off("connect_error", handleConnectError);

      if (hasStartedRef.current && playerRef.current) {
        socket.emit("cancel-matching", {
          userId: playerRef.current.userId,
        });
        hasStartedRef.current = false;
      }
    };
  }, [isConnected, router, socket, startMatching]);

  useEffect(() => {
    if (!matchDeadline) return;

    const timer = window.setInterval(() => {
      setMatchSecondsLeft(
        Math.max(0, Math.ceil((matchDeadline - Date.now()) / 1000)),
      );
    }, 250);

    return () => window.clearInterval(timer);
  }, [matchDeadline]);

  const cancelMatching = () => {
    if (socket && playerRef.current) {
      socket.emit("cancel-matching", {
        userId: playerRef.current.userId,
      });
    }
    router.push("/top");
  };

  const retryMatching = () => {
    hasStartedRef.current = false;
    setStatus(socket?.connected ? "waiting" : "connecting");
    if (socket?.connected) {
      startMatching();
    } else {
      socket?.connect();
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black px-5 text-white">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(34,211,238,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute h-[55vw] max-h-[620px] w-[55vw] max-w-[620px] animate-pulse rounded-full bg-cyan-500/10 blur-[100px]" />

      <section className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,.8)] backdrop-blur-xl sm:p-10">
        <p className="text-xs font-black tracking-[0.35em] text-cyan-300/70">
          ONLINE MATCH
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">
          {status === "matched" ? "マッチング成立" : "協力者を検索中"}
        </h1>
        <p className="mt-3 text-sm text-white/55">
          {userName ? `${userName} として参加中` : "プレイヤー情報を準備中"}
        </p>
        <p className="mt-2 text-xs font-black tracking-[0.2em] text-cyan-200/65">
          TEAM MEMBERS {playerCount} / 5
        </p>
        {matchSecondsLeft !== null && status === "waiting" && (
          <p className="mt-4 text-lg font-black tabular-nums text-amber-300">
            マッチ成立まで あと {matchSecondsLeft} 秒
          </p>
        )}

        <div className="mx-auto my-10 flex h-44 w-44 items-center justify-center">
          {status === "matched" ? (
            <div className="zoom-slash flex h-36 w-36 items-center justify-center rounded-full border-4 border-emerald-300 bg-emerald-400/15 text-6xl shadow-[0_0_55px_rgba(52,211,153,.35)]">
              ⚔️
            </div>
          ) : (
            <div className="relative h-36 w-36">
              <div className="absolute inset-0 animate-ping rounded-full border border-cyan-300/30" />
              <div className="absolute inset-4 animate-spin rounded-full border-4 border-cyan-300/15 border-t-cyan-300" />
              <div className="absolute inset-10 flex items-center justify-center rounded-full bg-cyan-400/10 text-4xl">
                🔍
              </div>
            </div>
          )}
        </div>

        <p className="min-h-6 font-bold text-white/75">
          {status === "connecting" && "サーバーに接続しています…"}
          {status === "waiting" && "一緒に戦うプレイヤーを待っています…"}
          {status === "matched" && "チームルームへ移動します"}
          {status === "error" && "サーバーへ接続できませんでした"}
        </p>

        <div className="mt-8 flex justify-center gap-3">
          {status === "error" && (
            <button
              type="button"
              onClick={retryMatching}
              className="rounded-xl bg-cyan-400 px-6 py-3 font-black text-black transition hover:bg-cyan-300"
            >
              再接続
            </button>
          )}
          {status !== "matched" && (
            <button
              type="button"
              onClick={cancelMatching}
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              キャンセル
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
