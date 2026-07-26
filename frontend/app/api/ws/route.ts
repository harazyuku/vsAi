/* eslint-disable @typescript-eslint/no-explicit-any */
import { experimental_upgradeWebSocket, type WebSocketData } from "@vercel/functions";
import type { WebSocket } from "ws";

type Client = { id: string; ws: WebSocket; userId?: string; roomId?: string };
const state = globalThis as typeof globalThis & {
  vsAiClients?: Map<string, Client>;
  vsAiQueue?: Map<string, any>;
  vsAiRooms?: Map<string, any>;
  vsAiMatchTimer?: ReturnType<typeof setTimeout> | null;
  vsAiMatchDeadline?: number | null;
};
const clients = state.vsAiClients ??= new Map();
const queue = state.vsAiQueue ??= new Map();
const rooms = state.vsAiRooms ??= new Map();
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;
const MATCH_WAIT_MS = 10_000;

const send = (client: Client | undefined, event: string, payload?: any) => {
  if (client?.ws.readyState === 1) client.ws.send(JSON.stringify({ event, payload }));
};
const sendId = (id: string, event: string, payload?: any) => send(clients.get(id), event, payload);
const roomSend = (roomId: string, event: string, payload?: any) => {
  const room = rooms.get(roomId);
  room?.players.forEach((player: any) => sendId(player.socketId, event, payload));
};
const publicRoom = (room: any) => {
  if (!room) return null;
  const copy = { ...room };
  delete copy.countdownTimer;
  return copy;
};
const waiting = () => {
  const payload = {
    status: "waiting",
    playerCount: queue.size,
    maxPlayers: MAX_PLAYERS,
    matchDeadline: state.vsAiMatchDeadline ?? null,
  };
  queue.forEach((player) => sendId(player.socketId, "matching-status", payload));
};
const match = () => {
  state.vsAiMatchTimer = null;
  state.vsAiMatchDeadline = null;
  if (queue.size < MIN_PLAYERS) return waiting();
  const matched = [...queue.values()].slice(0, MAX_PLAYERS);
  matched.forEach((player) => queue.delete(player.id));
  const id = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const room = {
    id, status: "ROOM_WAITING",
    players: matched.map((p) => ({ id: p.id, name: p.name, socketId: p.socketId, ready: false, role: "member" })),
    currentRound: 1, phase: "answer", messages: [], teamMessages: [],
    storyFinishedPlayerIds: [], battleReadyPlayerIds: [], nextRoundReadyPlayerIds: [],
    gameSelection: null, judgeResult: null, countdownTimer: null,
  };
  rooms.set(id, room);
  matched.forEach((p) => sendId(p.socketId, "match-success", { roomId: id, memberCount: matched.length }));
  waiting();
};

function handle(client: Client, event: string, data: any = {}) {
  if (event === "start-matching") {
    client.userId = data.userId;
    queue.set(data.userId, { id: data.userId, name: data.userName, socketId: client.id });
    if (queue.size >= MAX_PLAYERS) match();
    else if (queue.size >= MIN_PLAYERS && !state.vsAiMatchTimer) {
      state.vsAiMatchDeadline = Date.now() + MATCH_WAIT_MS;
      state.vsAiMatchTimer = setTimeout(match, MATCH_WAIT_MS);
      waiting();
    } else {
      waiting();
    }
    return;
  }
  if (event === "cancel-matching") {
    queue.delete(data.userId);
    if (queue.size < MIN_PLAYERS && state.vsAiMatchTimer) {
      clearTimeout(state.vsAiMatchTimer);
      state.vsAiMatchTimer = null;
      state.vsAiMatchDeadline = null;
    }
    waiting();
    return;
  }
  const room = rooms.get(data.roomId);
  if (event === "join-game-room") {
    if (!room) return;
    client.userId = data.userId; client.roomId = data.roomId;
    const player = room.players.find((p: any) => p.id === data.userId);
    if (player) player.socketId = client.id;
    roomSend(data.roomId, "room-sync", publicRoom(room)); return;
  }
  if (!room) return;
  const player = room.players.find((p: any) => p.id === data.userId);
  if (!player) return;
  if (event === "toggle-ready") {
    player.ready = data.ready;
    roomSend(data.roomId, "room-sync", publicRoom(room));
    if (room.players.length >= 2 && room.players.every((p: any) => p.ready) && !room.countdownTimer) {
      room.status = "STARTING";
      room.countdownTimer = setTimeout(() => {
        room.countdownTimer = null;
        const leader = room.players[Math.floor(Math.random() * room.players.length)];
        room.gameSelection = {
          aiId: ["komikado", "hiroyuki", "l"][Math.floor(Math.random() * 3)],
          topicBackground: ["school", "court", "deathgame"][Math.floor(Math.random() * 3)],
          stanceIndex: Math.floor(Math.random() * 2), leaderUserId: leader.id,
          leaderUserName: leader.name, teamSize: room.players.length,
        };
        room.status = "STORY";
        roomSend(data.roomId, "room-sync", publicRoom(room));
        roomSend(data.roomId, "game-start", room.gameSelection);
      }, 5000);
    }
  } else if (event === "story-finished" && !room.storyFinishedPlayerIds.includes(data.userId)) {
    room.storyFinishedPlayerIds.push(data.userId);
    roomSend(data.roomId, "story-player-finished", { userId: data.userId, userName: player.name, finishedCount: room.storyFinishedPlayerIds.length, totalPlayers: room.players.length });
    if (room.storyFinishedPlayerIds.length === room.players.length) roomSend(data.roomId, "all-stories-finished");
  } else if (event === "team-message" && data.content?.trim()) {
    const message = { userId: data.userId, name: player.name, content: data.content, createdAt: Date.now() };
    room.teamMessages.push(message); roomSend(data.roomId, "team-message", message);
  } else if (event === "battle-message" && data.content?.trim() && room.gameSelection?.leaderUserId === data.userId) {
    const message = { userId: data.userId, name: player.name, content: data.content, kind: data.kind, createdAt: Date.now() };
    room.messages.push(message); roomSend(data.roomId, "battle-message", message);
  } else if (event === "judge-result" && room.gameSelection?.leaderUserId === data.userId && !room.judgeResult) {
    room.judgeResult = data.result; roomSend(data.roomId, "judge-result", data.result);
  } else if (event === "battle-ready" || event === "next-round-ready") {
    const field = event === "battle-ready" ? "battleReadyPlayerIds" : "nextRoundReadyPlayerIds";
    if (!room[field].includes(data.userId)) room[field].push(data.userId);
    roomSend(data.roomId, `${event}-status`, { readyCount: room[field].length, totalPlayers: room.players.length, readyUserIds: room[field] });
    if (room[field].length === room.players.length) {
      room[field] = [];
      if (event === "next-round-ready") room.currentRound += 1;
      roomSend(data.roomId, event === "battle-ready" ? "battle-phase-start" : "next-round-start", { round: room.currentRound });
    }
  }
}

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    const client: Client = { id: crypto.randomUUID(), ws };
    clients.set(client.id, client);
    ws.on("message", (raw: WebSocketData) => {
      try {
        const message = JSON.parse(raw.toString());
        handle(client, message.event, message.payload);
      } catch { send(client, "connect_error"); }
    });
    ws.on("close", () => {
      clients.delete(client.id);
      if (client.userId) {
        queue.delete(client.userId);
        if (queue.size < MIN_PLAYERS && state.vsAiMatchTimer) {
          clearTimeout(state.vsAiMatchTimer);
          state.vsAiMatchTimer = null;
          state.vsAiMatchDeadline = null;
        }
      }
      waiting();
      if (client.roomId) {
        rooms.delete(client.roomId);
        roomSend(client.roomId, "player-disconnected", { userId: client.userId });
      }
    });
  });
}
