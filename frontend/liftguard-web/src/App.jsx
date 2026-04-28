import { useEffect, useRef, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL;

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  // ---------------- CONNECT WS ----------------
  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log("WS connected");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResult(data);
    };

    wsRef.current.onerror = (err) => {
      console.error("WS error:", err);
    };

    return () => wsRef.current.close();
  }, []);

  // ---------------- SEND FRAME ----------------
  const sendFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");

    canvas.width = 320;
    canvas.height = 240;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas
      .toDataURL("image/jpeg", 0.5)
      .split(",")[1];

    if (wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ image: base64 }));
    }
  };

  // ---------------- LOOP ----------------
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(sendFrame, 300);
    return () => clearInterval(interval);
  }, [running]);

  // ---------------- UI ----------------
  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    videoRef.current.src = URL.createObjectURL(file);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🚨 LiftGuard AI (Live)</h1>

      <input type="file" accept="video/*" onChange={handleVideo} />

      <div style={{ position: "relative", width: 600 }}>
        <video ref={videoRef} controls style={{ width: "100%" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Bounding boxes */}
        {result?.people?.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              border: "2px solid lime",
              left: p.bbox.x,
              top: p.bbox.y,
              width: p.bbox.w,
              height: p.bbox.h,
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "green",
            padding: "5px 10px",
          }}
        >
          {result?.summary?.risk || "NO DATA"}
        </div>
      </div>

      <br />

      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Stop</button>
    </div>
  );
}