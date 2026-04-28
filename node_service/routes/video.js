// File: node_service/routes/video.js

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

// allow larger uploads for videos (adjust as needed)
const upload = multer({
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

const PYTHON_BASE = process.env.PYTHON_URL || "http://localhost:8000";

// retry helper (handles cold starts / transient failures)
async function retry(fn, retries = 2, delayMs = 3000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return retry(fn, retries - 1, delayMs);
  }
}

router.post("/process-video", upload.single("file"), async (req, res) => {
  try {
    // ---- validation ----
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Missing file field 'file'" });
    }
    if (!req.file.mimetype.startsWith("video/")) {
      return res.status(400).json({ error: "Only video uploads are allowed" });
    }

    // ---- forward to Python ----
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "video.mp4",
      contentType: req.file.mimetype,
    });

    const response = await retry(() =>
      axios.post(`${PYTHON_BASE}/process-video`, form, {
        headers: form.getHeaders(),
        timeout: 300000, // 5 min for video
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      })
    );

    // Python returns JSON (may include base64 video)
    return res.json(response.data);
  } catch (err) {
    console.error("VIDEO ERROR:", err.message);
    if (err.response) {
      return res
        .status(err.response.status)
        .json({ error: "Upstream error", detail: err.response.data });
    }
    return res.status(500).json({ error: "Video processing failed" });
  }
});

module.exports = router;