// File: node_service/streamServer.js

const WebSocket = require("ws");
const axios = require("axios");

const PYTHON = process.env.PYTHON_URL;

function startStreamServer(server) {
  const wss = new WebSocket.Server({ server });

  console.log("WebSocket server started");

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (!data.image) return;

        const response = await axios.post(
          `${PYTHON}/analyze-frame`,
          { image: data.image },
          { timeout: 15000 }
        );

        ws.send(JSON.stringify(response.data));
      } catch (err) {
        console.error("WS ERROR:", err.message);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
}

module.exports = { startStreamServer };