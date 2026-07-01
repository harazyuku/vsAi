const RoomManager = require("./RoomManager");

class Matchmaker {
  constructor() {
    this.queue = []; // { id, name, socketId }
  }

  addToQueue(player) {
    // 重複登録の排除
    this.removeFromQueue(player.id);
    this.queue.push(player);
    return this.checkMatch();
  }

  removeFromQueue(playerId) {
    this.queue = this.queue.filter(p => p.id !== playerId);
  }

  checkMatch() {
    if (this.queue.length >= 2) {
      const player1 = this.queue.shift();
      const player2 = this.queue.shift();
      const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      const room = RoomManager.createRoom(roomId, player1, player2);
      return {
        matched: true,
        roomId,
        player1,
        player2,
        room
      };
    }
    return { matched: false };
  }
}

module.exports = new Matchmaker();
