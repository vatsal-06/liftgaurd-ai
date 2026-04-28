import { useState } from "react";
import axios from "axios";

const API = "https://liftguardai-node.onrender.com";

export default function App() {
  const [imageResult, setImageResult] = useState(null);
  const [videoStatus, setVideoStatus] = useState("");

  // -------- IMAGE --------
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await axios.post(`${API}/api/analyze`, form);
      setImageResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Image API failed (maybe backend still deploying)");
    }
  };

  // -------- VIDEO --------
  const handleVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      setVideoStatus("Uploading & processing...");

      const res = await axios.post(`${API}/process-video`, form, {
        timeout: 300000,
      });

      const binary = atob(res.data.annotated_video);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "annotated.mp4";
      a.click();

      setVideoStatus("Done ✅");
    } catch (err) {
      console.error(err);
      setVideoStatus("❌ Failed");
    }
  };

  return (
    <div className="container">
      <h1>🚨 LiftGuard AI</h1>

      {/* IMAGE */}
      <div className="card">
        <h2>Image Analysis</h2>
        <input type="file" accept="image/*" onChange={handleImage} />
        <pre>{JSON.stringify(imageResult, null, 2)}</pre>
      </div>

      {/* VIDEO */}
      <div className="card">
        <h2>Video Processing</h2>
        <input type="file" accept="video/*" onChange={handleVideo} />
        <p>{videoStatus}</p>
      </div>
    </div>
  );
}