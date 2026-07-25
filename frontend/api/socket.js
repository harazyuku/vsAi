/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const server = createServer();
const io = new Server(server, {
  transports: ["websocket"],
  cors: { origin: true, methods: ["GET", "POST"] },
});

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;
const MATCH_WAIT_MS = 3000;
const AI_IDS = ["komikado", "hiroyuki", "l"];
const TOPIC_BACKGROUNDS = ["school", "court", "deathgame"];
const queue = new Map();
const rooms = new Map();
let matchTimer = null;

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const publicRoom = (room) => {
  if (!room) return null;
  const data = { ...room };
  delete data.countdownTimer;
  return data;
};

function broadcastWaiting() {
  const payload = {
    status: "waiting",
    playerCount: queue.size,
    maxPlayers: MAX_PLAYERS,
  };
  for (const player of queue.values()) {
    io.to(player.socketId).emit("matching-status", payload);
  }
}

function createMatch() {
  if (matchTimer) clearTimeout(matchTimer);
  matchTimer = null;
  if (queue.size < MIN_PLAYERS) {
    broadcastWaiting();
    return;
  }

  const players = [...queue.values()].slice(0, MAX_PLAYERS);
  players.forEach((player) => queue.delete(player.id));
  const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const room = {
    id: roomId,
    status: "ROOM_WAITING",
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      socketId: player.socketId,
      ready: false,
      role: "member",
    })),
    currentRound: 1,
    phase: "answer",
    messages: [],
    teamMessages: [],
    storyFinishedPlayerIds: [],
    battleReadyPlayerIds: [],
    nextRoundReadyPlayerIds: [],
    gameSelection: null,
    judgeResult: null,
    countdownTimer: null,
  };
  rooms.set(roomId, room);
  players.forEach((player) => {
    io.to(player.socketId).emit("match-success", {
      roomId,
      memberCount: players.length,
    });
  });
  broadcastWaiting();
}

function scheduleMatch() {
  broadcastWaiting();
  if (queue.size >= MAX_PLAYERS) return createMatch();
  if (queue.size >= MIN_PLAYERS && !matchTimer) {
    matchTimer = setTimeout(createMatch, MATCH_WAIT_MS);
  }
}

io.on("connection", (socket) => {
  socket.on("start-matching", ({ userId, userName }) => {
    socket.data.userId = userId;
    queue.set(userId, { id: userId, name: userName, socketId: socket.id });
    scheduleMatch();
  });

  socket.on("cancel-matching", ({ userId }) => {
    queue.delete(userId);
    socket.emit("matching-status", { status: "idle" });
    broadcastWaiting();
  });

  socket.on("join-game-room", ({ roomId, userId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    socket.data.userId = userId;
    socket.data.roomId = roomId;
    socket.join(roomId);
    const player = room.players.find((candidate) => candidate.id === userId);
    if (player) player.socketId = socket.id;
    io.to(roomId).emit("room-sync", publicRoom(room));
  });

  socket.on("toggle-ready", ({ roomId, userId, ready }) => {
    const room = rooms.get(roomId);
    const player = room?.players.find((candidate) => candidate.id === userId);
    if (!room || !player) return;
    player.ready = ready;
    io.to(roomId).emit("room-sync", publicRoom(room));

    if (
      room.players.length >= MIN_PLAYERS &&
      room.players.every((candidate) => candidate.ready) &&
      !room.countdownTimer
    ) {
      room.status = "STARTING";
      io.to(roomId).emit("room-sync", publicRoom(room));
      room.countdownTimer = setTimeout(() => {
        room.countdownTimer = null;
        if (!room.players.every((candidate) => candidate.ready)) return;
        const leader = pick(room.players);
        room.gameSelection = {
          aiId: pick(AI_IDS),
          topicBackground: pick(TOPIC_BACKGROUNDS),
          stanceIndex: Math.floor(Math.random() * 2),
          leaderUserId: leader.id,
          leaderUserName: leader.name,
          teamSize: room.players.length,
        };
        room.status = "STORY";
        io.to(roomId).emit("room-sync", publicRoom(room));
        io.to(roomId).emit("game-start", room.gameSelection);
      }, 5000);
    }
  });

  socket.on("story-finished", ({ roomId, userId }) => {
    const room = rooms.get(roomId);
    const player = room?.players.find((candidate) => candidate.id === userId);
    if (!room || !player || room.storyFinishedPlayerIds.includes(userId)) return;
    room.storyFinishedPlayerIds.push(userId);
    io.to(roomId).emit("story-player-finished", {
      userId,
      userName: player.name,
      finishedCount: room.storyFinishedPlayerIds.length,
      totalPlayers: room.players.length,
    });
    if (room.storyFinishedPlayerIds.length === room.players.length) {
      io.to(roomId).emit("all-stories-finished");
    }
  });

  socket.on("team-message", ({ roomId, userId, content }) => {
    const room = rooms.get(roomId);
    const player = room?.players.find((candidate) => candidate.id === userId);
    if (!room || !player || !content?.trim()) return;
    const message = { userId, name: player.name, content, createdAt: Date.now() };
    room.teamMessages.push(message);
    io.to(roomId).emit("team-message", message);
  });

  socket.on("battle-message", ({ roomId, userId, content, kind }) => {
    const room = rooms.get(roomId);
    const player = room?.players.find((candidate) => candidate.id === userId);
    if (
      !room ||
      !player ||
      !content?.trim() ||
      !["player", "ai"].includes(kind) ||
      room.gameSelection?.leaderUserId !== userId
    ) return;
    const message = {
      userId,
      name: player.name,
      content,
      kind,
      createdAt: Date.now(),
    };
    room.messages.push(message);
    io.to(roomId).emit("battle-message", message);
  });

  const readyHandler = (field, statusEvent, startEvent, advanceRound = false) =>
    ({ roomId, userId }) => {
      const room = rooms.get(roomId);
      if (
        !room ||
        !room.players.some((player) => player.id === userId) ||
        room[field].includes(userId)
      ) return;
      room[field].push(userId);
      io.to(roomId).emit(statusEvent, {
        readyCount: room[field].length,
        totalPlayers: room.players.length,
        readyUserIds: room[field],
      });
      if (room[field].length === room.players.length) {
        room[field] = [];
        if (advanceRound) room.currentRound += 1;
        io.to(roomId).emit(
          startEvent,
          advanceRound ? { round: room.currentRound } : undefined,
        );
      }
    };

  socket.on(
    "battle-ready",
    readyHandler("battleReadyPlayerIds", "battle-ready-status", "battle-phase-start"),
  );
  socket.on(
    "next-round-ready",
    readyHandler(
      "nextRoundReadyPlayerIds",
      "next-round-ready-status",
      "next-round-start",
      true,
    ),
  );

  socket.on("judge-result", ({ roomId, userId, result }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameSelection?.leaderUserId !== userId || !result || room.judgeResult) return;
    room.judgeResult = result;
    room.status = "JUDGING";
    io.to(roomId).emit("judge-result", result);
  });

  socket.on("disconnect", () => {
    if (socket.data.userId) {
      queue.delete(socket.data.userId);
      broadcastWaiting();
    }
    if (socket.data.roomId) {
      rooms.delete(socket.data.roomId);
      io.to(socket.data.roomId).emit("player-disconnected", {
        userId: socket.data.userId,
      });
    }
  });
});

module.exports = server;
