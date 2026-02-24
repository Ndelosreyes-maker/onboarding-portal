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
const BOARD_ID = 18397647993;

// 🔍 Find item by Portal ID
async function findItemByPortalId(portalId) {
  const query = `
    query {
      items_page_by_column_values(
        board_id: ${BOARD_ID},
        columns: [{
          column_id: "pulse_id_mm0wa6sj",
          column_values: ["${portalId}"]
        }]
      ) {
        items { id }
      }
    }
  `;

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: MONDAY_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  return data.data.items_page_by_column_values.items[0]?.id;
}

// 📎 Upload file
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

// 📅 Update date
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
    const { portalId, physicalExp, liabilityExp, registrationExp } = req.body;

    const itemId = await findItemByPortalId(portalId);

    if (!itemId) {
      return res.status(404).send("Invalid Portal ID");
    }

    for (let file of req.files) {
      await uploadFile(itemId, file.fieldname, file.path);
    }

    if (physicalExp)
      await updateDate(itemId, "date_mm02gj3n", physicalExp);

    if (liabilityExp)
      await updateDate(itemId, "date_mm02942n", liabilityExp);

    if (registrationExp)
      await updateDate(itemId, "date_mm02ew9z", registrationExp);

    res.send("Success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
