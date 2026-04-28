const axios = require("axios");

const PYTHON = process.env.PYTHON_URL;

exports.analyzeImage = async (file) => {
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const res = await axios.post(`${PYTHON}/analyze-image`, form, {
    headers: form.getHeaders(),
  });

  return res.data;
};