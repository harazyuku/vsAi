class Matchmaker {
  constructor() {
    this.queue = []; // { id, name, socketId }
  }

  addToQueue(player) {
    this.removeFromQueue(player.id);
    this.queue.push(player);
    return this.queue.length;
  }

  removeFromQueue(playerId) {
    this.queue = this.queue.filter((player) => player.id !== playerId);
    return this.queue.length;
  }

  takePlayers(maxPlayers) {
    return this.queue.splice(0, maxPlayers);
  }

  getPlayers() {
    return [...this.queue];
  }

  get size() {
    return this.queue.length;
  }
}

module.exports = new Matchmaker();
