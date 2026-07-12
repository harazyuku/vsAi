class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, player1, player2) {
    const room = {
      id: roomId,
      status: "ROOM_WAITING",
      players: [
        {
          id: player1.id,
          name: player1.name,
          socketId: null,
          ready: false,
          stance: "賛成",
        },
        {
          id: player2.id,
          name: player2.name,
          socketId: null,
          ready: false,
          stance: "反対",
        },
      ],
      currentRound: 1,
      phase: "answer",
      messages: [],
      teamMessages: [],
      timeLeft: 30,
      timer: null,
    };

    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getPublicRoom(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const { timer, ...publicRoom } = room;
    return publicRoom;
  }

  joinPlayer(roomId, userId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const player = room.players.find((p) => p.id === userId);
    if (player) {
      player.socketId = socketId;
    }

    return room;
  }

  setPlayerReady(roomId, userId, readyState) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const player = room.players.find((p) => p.id === userId);
    if (player) {
      player.ready = readyState;
    }

    const allReady =
      room.players.length === 2 &&
      room.players.every((p) => p.ready);

    if (allReady) {
      room.status = "BATTLE";
      this.startBattle(room);
    }

    return room;
  }

  startBattle(room) {
    room.timeLeft = 60;

    this.startTimer(room.id, () => {
      this.nextPhaseOrRound(room.id);
    });
  }

  nextPhaseOrRound(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return;

    if (room.phase === "answer") {
      room.phase = "reply";
      room.timeLeft = 60;
    } else {
      if (room.currentRound >= 5) {
        room.status = "JUDGING";
        room.timeLeft = 0;

        if (room.timer) {
          clearInterval(room.timer);
          room.timer = null;
        }
      } else {
        room.currentRound += 1;
        room.phase = "answer";
        room.timeLeft = 60;
      }
    }
  }

  startTimer(roomId, onTimeout) {
    const room = this.getRoom(roomId);
    if (!room) return;

    if (room.timer) {
      clearInterval(room.timer);
    }

    room.timer = setInterval(() => {
      const r = this.getRoom(roomId);
      if (!r) {
        clearInterval(room.timer);
        room.timer = null;
        return;
      }

      r.timeLeft -= 1;

      if (r.timeLeft <= 0) {
        clearInterval(room.timer);
        room.timer = null;
        onTimeout();
      }
    }, 1000);
  }

  removeRoom(roomId) {
    const room = this.getRoom(roomId);

    if (room?.timer) {
      clearInterval(room.timer);
    }

    this.rooms.delete(roomId);
  }
}

module.exports = new RoomManager();