const Matchmaker = require("../managers/Matchmaker");
const RoomManager = require("../managers/RoomManager");

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;
const MATCH_WAIT_MS = 10_000;
const AI_IDS = ["komikado", "hiroyuki", "l"];
const TOPIC_BACKGROUNDS = ["school", "court", "deathgame"];
let matchTimer = null;
let matchDeadline = null;

function broadcastWaitingStatus(io) {
  const players = Matchmaker.getPlayers();
  const payload = {
    status: "waiting",
    playerCount: players.length,
    maxPlayers: MAX_PLAYERS,
    matchDeadline,
  };

  players.forEach((player) => {
    io.to(player.socketId).emit("matching-status", payload);
  });
}

function createMatch(io) {
  if (matchTimer) {
    clearTimeout(matchTimer);
    matchTimer = null;
  }
  matchDeadline = null;

  if (Matchmaker.size < MIN_PLAYERS) {
    broadcastWaitingStatus(io);
    return;
  }

  const players = Matchmaker.takePlayers(MAX_PLAYERS);
  const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  RoomManager.createRoom(roomId, players);
  players.forEach((player) => {
    io.to(player.socketId).emit("match-success", {
      roomId,
      memberCount: players.length,
    });
  });

  broadcastWaitingStatus(io);
}

function scheduleMatch(io) {
  if (Matchmaker.size >= MAX_PLAYERS) {
    createMatch(io);
    return;
  }

  if (Matchmaker.size >= MIN_PLAYERS && !matchTimer) {
    matchDeadline = Date.now() + MATCH_WAIT_MS;
    matchTimer = setTimeout(() => createMatch(io), MATCH_WAIT_MS);
  }

  broadcastWaitingStatus(io);
}

function selectRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

module.exports = (io, socket) => {
  // ①マッチング開始
  socket.on("start-matching", ({ userId, userName }) => {
    socket.userId = userId;
    socket.userName = userName;

    Matchmaker.addToQueue({
      id: userId,
      name: userName,
      socketId: socket.id,
    });
    scheduleMatch(io);
  });

  // ②キャンセル
  socket.on("cancel-matching", ({ userId }) => {
    Matchmaker.removeFromQueue(userId);
    if (Matchmaker.size < MIN_PLAYERS && matchTimer) {
      clearTimeout(matchTimer);
      matchTimer = null;
      matchDeadline = null;
    }
    socket.emit("matching-status", { status: "idle" });
    broadcastWaitingStatus(io);
  });

  // ③入室
  socket.on("join-game-room", ({ roomId, userId }) => {
    socket.userId = userId;
    socket.join(roomId);
    socket.roomId = roomId;

    const room = RoomManager.joinPlayer(roomId, userId, socket.id);

    if (room) {
      io.to(roomId).emit("room-sync", RoomManager.getPublicRoom(roomId));
    }
  });

  // ④準備
  socket.on("toggle-ready", ({ roomId, userId, ready }) => {
    const room = RoomManager.setPlayerReady(roomId, userId, ready);

    if (room) {
      io.to(roomId).emit("room-sync", RoomManager.getPublicRoom(roomId));

      if (room.status === "STARTING") {
        RoomManager.scheduleGameStart(roomId, (startingRoom) => {
          const leader = selectRandom(startingRoom.players);
          const gameSelection = {
            aiId: selectRandom(AI_IDS),
            topicBackground: selectRandom(TOPIC_BACKGROUNDS),
            stanceIndex: Math.floor(Math.random() * 2),
            leaderUserId: leader.id,
            leaderUserName: leader.name,
            teamSize: startingRoom.players.length,
          };

          startingRoom.gameSelection = gameSelection;
          startingRoom.status = "STORY";

          io.to(roomId).emit("room-sync", RoomManager.getPublicRoom(roomId));
          io.to(roomId).emit("game-start", gameSelection);
        });
      }
    }
  });

  // ⑤ストーリー閲覧完了
  socket.on("story-finished", ({ roomId, userId }) => {
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    const player = room.players.find((candidate) => candidate.id === userId);
    if (!player || room.storyFinishedPlayerIds.includes(userId)) return;

    room.storyFinishedPlayerIds.push(userId);
    const payload = {
      userId,
      userName: player.name,
      finishedCount: room.storyFinishedPlayerIds.length,
      totalPlayers: room.players.length,
    };

    io.to(roomId).emit("story-player-finished", payload);

    if (room.storyFinishedPlayerIds.length === room.players.length) {
      io.to(roomId).emit("all-stories-finished");
    }
  });

  // ⑥メッセージ
  socket.on("submit-debate-message", ({ roomId, userId, content }) => {
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === userId);
    if (!player) return;

    room.messages.push({
      role: userId === room.players[0].id ? "player1" : "player2",
      senderName: player.name,
      content,
      round: room.currentRound,
    });

    RoomManager.nextPhaseOrRound(roomId);

    io.to(roomId).emit("room-sync", RoomManager.getPublicRoom(roomId));
  });

  // ⑦チームチャット
  socket.on("team-message", ({ roomId, userId, content }) => {
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === userId);
    if (!player) return;

    const msg = {
      userId,
      name: player.name,
      content,
      createdAt: Date.now(),
    };

    if (!room.teamMessages) {
      room.teamMessages = [];
    }

    room.teamMessages.push(msg);

    io.to(roomId).emit("team-message", msg);
  });

  // ⑧バトルチャット
  socket.on("battle-message", ({ roomId, userId, content, kind }) => {
    const room = RoomManager.getRoom(roomId);
    if (!room || !content?.trim()) return;

    const player = room.players.find((candidate) => candidate.id === userId);
    if (!player || !["player", "ai"].includes(kind)) return;
    if (room.gameSelection?.leaderUserId !== userId) return;

    const msg = {
      userId,
      name: player.name,
      content,
      kind,
      createdAt: Date.now(),
    };

    room.messages.push(msg);
    io.to(roomId).emit("battle-message", msg);
  });

  // ⑨バトルフェーズ準備
  socket.on("battle-ready", ({ roomId, userId }) => {
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    const playerExists = room.players.some((player) => player.id === userId);
    if (!playerExists || room.battleReadyPlayerIds.includes(userId)) return;

    room.battleReadyPlayerIds.push(userId);
    io.to(roomId).emit("battle-ready-status", {
      readyCount: room.battleReadyPlayerIds.length,
      totalPlayers: room.players.length,
      readyUserIds: room.battleReadyPlayerIds,
    });

    if (room.battleReadyPlayerIds.length === room.players.length) {
      room.battleReadyPlayerIds = [];
      io.to(roomId).emit("battle-phase-start");
    }
  });

  // ⑩次ラウンド準備
  socket.on("next-round-ready", ({ roomId, userId }) => {
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    const playerExists = room.players.some((player) => player.id === userId);
    if (
      !playerExists ||
      room.nextRoundReadyPlayerIds.includes(userId)
    ) return;

    room.nextRoundReadyPlayerIds.push(userId);
    io.to(roomId).emit("next-round-ready-status", {
      readyCount: room.nextRoundReadyPlayerIds.length,
      totalPlayers: room.players.length,
      readyUserIds: room.nextRoundReadyPlayerIds,
    });

    if (room.nextRoundReadyPlayerIds.length === room.players.length) {
      room.nextRoundReadyPlayerIds = [];
      room.currentRound += 1;
      io.to(roomId).emit("next-round-start", {
        round: room.currentRound,
      });
    }
  });

  // ⑪AI審判結果
  socket.on("judge-result", ({ roomId, userId, result }) => {
    const room = RoomManager.getRoom(roomId);
    if (
      !room ||
      room.gameSelection?.leaderUserId !== userId ||
      !result ||
      room.judgeResult
    ) return;

    room.judgeResult = result;
    room.status = "JUDGING";
    io.to(roomId).emit("judge-result", result);
  });

  // ⑫切断
  socket.on("disconnect", () => {
    if (socket.userId) {
      Matchmaker.removeFromQueue(socket.userId);
      if (Matchmaker.size < MIN_PLAYERS && matchTimer) {
        clearTimeout(matchTimer);
        matchTimer = null;
        matchDeadline = null;
      }
      broadcastWaitingStatus(io);
    }

    if (socket.roomId) {
      RoomManager.removeRoom(socket.roomId);

      io.to(socket.roomId).emit("player-disconnected", {
        userId: socket.userId,
      });
    }
  });
};
