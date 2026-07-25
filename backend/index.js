const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const gameHandler = require("./src/sockets/gameHandler");

const app = express();
const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: clientOrigins }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientOrigins,
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

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

server.listen(port, () => {
  console.log(`Realtime Debate Server running on port ${port}`);
});
