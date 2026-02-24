const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const MONDAY_KEY = process.env.MONDAY_API_KEY;

// upload file to column
async function uploadFile(itemId, columnId, filePath) {
  const form = new FormData();

  form.append("query", `
    mutation ($file: File!) {
      add_file_to_column(
        item_id: ${itemId},
        column_id: "${columnId}",
        file: $file
      ) { id }
    }
  `);

  form.append("variables[file]", fs.createReadStream(filePath));

  await fetch("https://api.monday.com/v2/file", {
    method: "POST",
    headers: { Authorization: MONDAY_KEY },
    body: form
  });
}

// update date column
async function updateDate(itemId, columnId, date) {
  const query = `
    mutation {
      change_simple_column_value(
        item_id: ${itemId},
        column_id: "${columnId}",
        value: "${date}"
      ) { id }
    }
  `;

  await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: MONDAY_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });
}

app.post("/upload", upload.any(), async (req, res) => {
  try {
    const itemId = req.body.itemId;

    for (let file of req.files) {
      await uploadFile(itemId, file.fieldname, file.path);
    }

    if (req.body.physicalExp)
      await updateDate(itemId, "physical_exp", req.body.physicalExp);

    if (req.body.liabilityExp)
      await updateDate(itemId, "liability_exp", req.body.liabilityExp);

    if (req.body.registrationExp)
      await updateDate(itemId, "registration_exp", req.body.registrationExp);

    res.send("Uploaded successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
