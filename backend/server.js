const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET","POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const MONDAY_KEY = process.env.MONDAY_API_KEY;
const BOARD_ID = 18397647993;

/* ===============================
   FIND ITEM BY PORTAL ID
================================ */

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
        items {
          id
          name
          column_values {
            id
            text
            value
          }
        }
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

  if (!data.data || !data.data.items_page_by_column_values.items.length) {
    return null;
  }

  return data.data.items_page_by_column_values.items[0];
}

/* ===============================
   UPLOAD FILE TO MONDAY
================================ */

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

  const response = await fetch("https://api.monday.com/v2/file", {
    method: "POST",
    headers: {
      Authorization: MONDAY_KEY
    },
    body: form
  });

  const text = await response.text();

  if (!response.ok) {
    console.error("File Upload Error:", text);
    throw new Error(text);
  }
}

/* ===============================
   UPDATE DATE COLUMN
================================ */

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

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: MONDAY_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  const data = await res.text();

  if (!res.ok) {
    console.error("Date Update Error:", data);
    throw new Error(data);
  }
}

/* ===============================
   LOOKUP ROUTE
================================ */

app.post("/lookup", async (req, res) => {
  try {
    const { portalId } = req.body;

    const item = await findItemByPortalId(portalId);

    if (!item) {
      return res.status(404).json({ error: "Invalid Portal ID" });
    }

    res.json(item);

  } catch (err) {
    console.error("Lookup Error:", err.message);
    res.status(500).json({ error: "Lookup failed" });
  }
});

/* ===============================
   UPLOAD ROUTE
================================ */

app.post("/upload", upload.any(), async (req, res) => {
  try {
    const { portalId, physicalExp, liabilityExp, registrationExp } = req.body;

    const item = await findItemByPortalId(portalId);

    if (!item) {
      return res.status(404).json({ error: "Invalid Portal ID" });
    }

    const itemId = item.id;

    // Upload files
    for (let file of req.files) {
      await uploadFile(itemId, file.fieldname, file.path);
    }

    // Update expiration dates
    if (physicalExp)
      await updateDate(itemId, "date_mm02gj3n", physicalExp);

    if (liabilityExp)
      await updateDate(itemId, "date_mm02942n", liabilityExp);

    if (registrationExp)
      await updateDate(itemId, "date_mm02ew9z", registrationExp);

    res.json({ success: true });

  } catch (err) {
    console.error("Upload Route Error:", err.message);
    res.status(500).json({ error: "Upload failed", detail: err.message });
  }
});

/* ===============================
   START SERVER
================================ */

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
