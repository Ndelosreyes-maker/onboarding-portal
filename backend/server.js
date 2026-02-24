const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");

const app = express();

/* ================= CORS FIX ================= */
app.use(cors({
  origin: "*"
}));
app.options("*", cors());

app.use(express.json());

const upload = multer({ dest: "uploads/" });

const MONDAY_KEY = process.env.MONDAY_API_KEY;
const BOARD_ID = 18397647993;

/* ================= FIND ITEM ================= */
async function findItem(portalId){
  const query = `
  query {
    items_page_by_column_values(
      board_id:${BOARD_ID},
      columns:[{
        column_id:"pulse_id_mm0wa6sj",
        column_values:["${portalId}"]
      }]
    ){
      items{ id name }
    }
  }`;

  const r = await fetch("https://api.monday.com/v2",{
    method:"POST",
    headers:{
      Authorization:MONDAY_KEY,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({query})
  });

  const d = await r.json();
  return d.data.items_page_by_column_values.items[0];
}

/* ================= LOOKUP ================= */
app.post("/lookup", async(req,res)=>{
  try{
    const item = await findItem(req.body.portalId);
    if(!item) return res.status(404).send("Invalid Portal ID");
    res.json(item);
  }catch(e){
    console.log(e);
    res.status(500).send("lookup error");
  }
});

/* ================= UPLOAD ================= */
app.post("/upload", upload.any(), async(req,res)=>{
  try{
    const item = await findItem(req.body.portalId);
    if(!item) return res.status(404).send("Invalid Portal ID");

    const itemId = item.id;

    for(const file of req.files){
      const form = new FormData();
      form.append("query",`
        mutation($file:File!){
          add_file_to_column(
            item_id:${itemId},
            column_id:"${file.fieldname}",
            file:$file
          ){id}
        }`);
      form.append("variables[file]",fs.createReadStream(file.path));

      await fetch("https://api.monday.com/v2/file",{
        method:"POST",
        headers:{Authorization:MONDAY_KEY},
        body:form
      });
    }

    res.send("ok");

  }catch(err){
    console.log("UPLOAD ERROR:",err);
    res.status(500).send("upload failed");
  }
});

app.listen(process.env.PORT||3000,()=>{
  console.log("Server running");
});
