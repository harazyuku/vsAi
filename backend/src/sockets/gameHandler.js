const Matchmaker = require("../managers/Matchmaker");
const RoomManager = require("../managers/RoomManager");

module.exports = (io, socket) => {
  // ①マッチング開始
  socket.on("start-matching", ({ userId, userName }) => {
    socket.userId = userId;
    socket.userName = userName;

    const result = Matchmaker.addToQueue({
      id: userId,
      name: userName,
      socketId: socket.id,
    });

    if (result.matched) {
      io.to(result.player1.socketId).emit("match-success", {
        roomId: result.roomId,
      });

      io.to(result.player2.socketId).emit("match-success", {
        roomId: result.roomId,
      });
    } else {
      socket.emit("matching-status", { status: "waiting" });
    }
  });

  // ②キャンセル
  socket.on("cancel-matching", ({ userId }) => {
    Matchmaker.removeFromQueue(userId);
    socket.emit("matching-status", { status: "idle" });
  });

  // ③入室
  socket.on("join-game-room", ({ roomId, userId }) => {
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
    }
  });

  // ⑤メッセージ
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

  // ⑥チームチャット（これが正解）
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

  // ⑦切断
  socket.on("disconnect", () => {
    if (socket.userId) {
      Matchmaker.removeFromQueue(socket.userId);
    }

    if (socket.roomId) {
      RoomManager.removeRoom(socket.roomId);

      io.to(socket.roomId).emit("player-disconnected", {
        userId: socket.userId,
      });
    }
  });
};