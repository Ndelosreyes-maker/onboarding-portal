const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res)=>{
  res.send("Upload successful");
});

app.listen(3000, ()=>{
  console.log("Server running on 3000");
});
