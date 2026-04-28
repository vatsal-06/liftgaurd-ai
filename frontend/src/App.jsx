// File: src/App.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Analytics from "./components/Analytics";
import Alerts from "./components/Alerts";

const NODE_BASE = "https://liftguardai-node.onrender.com";
// If you don't have Node proxy for video, you can switch to:
const VIDEO_API = "https://liftguardai.onrender.com/process-video";
// const VIDEO_API = `${NODE_BASE}/process-video`;

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  // video processing state
  const [videoFile, setVideoFile] = useState(null);
  const [videoStatus, setVideoStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // frame-by-frame inference loop
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(captureAndSend, 800);
    return () => clearInterval(interval);
  }, [running]);

  const captureAndSend = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg").split(",")[1];

    try {
      const res = await axios.post(`${NODE_BASE}/api/analyze`, {
        image: base64,
      });

      setResult(res.data);
    } catch (err) {
      console.error("Analyze error:", err.message);
    }
  };

  // ---------------- VIDEO UPLOAD ----------------

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    videoRef.current.src = URL.createObjectURL(file);
    setVideoFile(file);
  };

  // ---------------- PROCESS VIDEO ----------------

  const processVideo = async () => {
    if (!videoFile) {
      alert("Upload a video first");
      return;
    }

    if (videoFile.size > 20 * 1024 * 1024) {
      const confirm = window.confirm(
        "Large video (>20MB). This may be slow. Continue?"
      );
      if (!confirm) return;
    }

    try {
      setIsProcessing(true);
      setVideoStatus("Encoding video...");

      const buffer = await videoFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      setVideoStatus("Uploading & processing... (can take ~30-60s)");

      const res = await axios.post(
        VIDEO_API,
        {
          video: base64,
          filename: videoFile.name || "video.mp4",
        },
        {
          timeout: 300000, // 5 min
        }
      );

      const annotatedBase64 = res.data.annotated_video;

      setVideoStatus("Decoding result...");

      const binary = atob(annotatedBase64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      // trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "annotated_video.mp4";
      a.click();

      setVideoStatus("Saved annotated video ✅");
    } catch (err) {
      console.error(err);
      setVideoStatus("❌ Failed to process video");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="content">
          {/* VIDEO PANEL */}
          <div className="video-section">
            <div className="video-wrapper">
              <video ref={videoRef} controls />

              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* Bounding Boxes */}
              {result?.people?.map((p, i) => {
                const video = videoRef.current;
                if (!video) return null;

                const scaleX = video.clientWidth / video.videoWidth;
                const scaleY = video.clientHeight / video.videoHeight;

                return (
                  <div
                    key={i}
                    className="bbox"
                    style={{
                      left: p.bbox.x * scaleX,
                      top: p.bbox.y * scaleY,
                      width: p.bbox.w * scaleX,
                      height: p.bbox.h * scaleY,
                    }}
                  />
                );
              })}

              <div className="risk">
                {result?.summary?.risk || "NO DATA"}
              </div>
            </div>

            {/* CONTROLS */}
            <div className="controls">
              <input type="file" accept="video/*" onChange={handleUpload} />

              <button onClick={() => setRunning(true)}>Start AI</button>
              <button onClick={() => setRunning(false)}>Stop</button>

              <button onClick={processVideo} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Process Video"}
              </button>

              <div className="status">{videoStatus}</div>
            </div>
          </div>

          <Analytics result={result} />
        </div>

        <Alerts />
      </div>
    </div>
  );
}