const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const gameHandler = require("./src/sockets/gameHandler");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Next.js のフロントエンドポートに合わせます
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  gameHandler(io, socket);
});

// 既存のマッチングAPI(互換性のために残す、または移行先として活用)
app.post("/match", (req, res) => {
  // 後で必要に応じてREST用のロジックをここに書くことも可能
  res.json({ message: "REST match is deprecated. Please use real-time socket matching." });
});

server.listen(3001, () => {
  console.log("Realtime Debate Server running on port 3001");
});
