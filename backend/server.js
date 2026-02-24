const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    const response = await fetch("https://api.monday.com/v2/file", {
      method: "POST",
      headers: {
        "Authorization": process.env.MONDAY_API_KEY
      },
      body: file.buffer
    });

    const data = await response.text();

    res.send("Uploaded to Monday successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
