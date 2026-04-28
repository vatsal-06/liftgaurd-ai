// File: node_service/routes/analyze.js

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

const PYTHON_BASE = process.env.PYTHON_URL || "http://localhost:8000";

// simple retry helper (handles Render cold starts)
async function retry(fn, retries = 2, delayMs = 2000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return retry(fn, retries - 1, delayMs);
  }
}

router.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    // ---- validation ----
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Missing file field 'file'" });
    }
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Only image uploads are allowed" });
    }

    // ---- forward to Python ----
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype,
    });

    const response = await retry(() =>
      axios.post(`${PYTHON_BASE}/analyze-image`, form, {
        headers: form.getHeaders(),
        timeout: 20000,
        maxBodyLength: Infinity,
      })
    );

    return res.json(response.data);
  } catch (err) {
    console.error("ANALYZE ERROR:", err.message);
    if (err.response) {
      return res
        .status(err.response.status)
        .json({ error: "Upstream error", detail: err.response.data });
    }
    return res.status(500).json({ error: "Image analysis failed" });
  }
});

module.exports = router;