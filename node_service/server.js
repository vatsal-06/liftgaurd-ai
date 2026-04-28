// File: node_service/server.js

const express = require("express");
const http = require("http");
const cors = require("cors");

const analyzeRoutes = require("./routes/analyze");
const videoRoutes = require("./routes/video");
const { startStreamServer } = require("./streamServer");

const app = express();
const server = http.createServer(app);

app.use(cors());

// health
app.get("/healthz", (req, res) => {
  res.json({ status: "node-ok" });
});

// REST routes
app.use(analyzeRoutes);
app.use(videoRoutes);

// 🔥 WebSocket server attached to SAME HTTP server (important for Render)
startStreamServer(server);

const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
  console.log(`Node running on port ${PORT}`);
});