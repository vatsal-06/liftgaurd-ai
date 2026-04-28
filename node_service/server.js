const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer();

const PYTHON = process.env.PYTHON_URL;

// ---------- IMAGE ----------
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  const form = new FormData();
  form.append("file", req.file.buffer, req.file.originalname);

  const response = await axios.post(`${PYTHON}/analyze-image`, form, {
    headers: form.getHeaders(),
  });

  res.json(response.data);
});

// ---------- VIDEO ----------
app.post("/process-video", upload.single("file"), async (req, res) => {
  const form = new FormData();
  form.append("file", req.file.buffer, req.file.originalname);

  const response = await axios.post(`${PYTHON}/process-video`, form, {
    headers: form.getHeaders(),
    timeout: 300000,
  });

  res.json(response.data);
});

app.listen(5500, () => console.log("Node running"));