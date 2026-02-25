const API = "https://onboarding-portal-hy2o.onrender.com";

const portalInput = document.getElementById("portalId");
const profileResult = document.getElementById("profileResult");
const portalScreen = document.getElementById("portalScreen");
const searchScreen = document.getElementById("searchScreen");

const modal = document.getElementById("modal");
const submitBtn = document.getElementById("submitBtn");
const confirmBtn = document.getElementById("confirmBtn");
const cancelBtn = document.getElementById("cancelBtn");
const toast = document.getElementById("toast");

/* =========================
   LOOKUP EMPLOYEE
========================= */

document.getElementById("findBtn").onclick = lookup;
portalInput.addEventListener("keydown", e=>{
  if(e.key==="Enter") lookup();
});

async function lookup(){
  const portalId = portalInput.value.trim();
  if(!portalId) return;

  const response = await fetch(`${API}/lookup`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ portalId })
  });

  if(!response.ok) return;

  const item = await response.json();

  window.cachedItem = item;
  window.cachedPortalId = portalId;

  profileResult.innerHTML = `
    <div class="profileCard" onclick="openPortal()">
      ${item.name}
    </div>
  `;
}

function openPortal(){
  searchScreen.style.display = "none";
  portalScreen.style.display = "block";

  document.getElementById("employeeName").innerText =
    window.cachedItem.name;

  showProgress(window.cachedItem);
  updateDocStatuses(window.cachedItem);
}

/* =========================
   SUBMIT DOCUMENTS
========================= */

submitBtn.onclick = () => modal.style.display = "flex";
cancelBtn.onclick = () => modal.style.display = "none";

confirmBtn.onclick = async () => {

  modal.style.display = "none";

  const formData = new FormData();
  formData.append("portalId", window.cachedPortalId);

  formData.append("physicalExp", document.getElementById("physicalExp")?.value || "");
  formData.append("liabilityExp", document.getElementById("liabilityExp")?.value || "");
  formData.append("registrationExp", document.getElementById("registrationExp")?.value || "");

  document.querySelectorAll("input[type=file]").forEach(input=>{
    if(input.files[0]){
      formData.append(input.name, input.files[0]);
    }
  });

  const res = await fetch(`${API}/upload`, {
    method: "POST",
    body: formData
  });

  if(res.ok){

    toast.innerText = "Uploaded ✓";
    toast.style.background = "#22c55e";
    toast.style.display = "block";
    setTimeout(()=>toast.style.display="none",3000);

    // 🔥 REFRESH DATA FROM MONDAY
    const response = await fetch(`${API}/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portalId: window.cachedPortalId })
    });

    const item = await response.json();
    window.cachedItem = item;

    showProgress(item);
    updateDocStatuses(item);

  } else {

    toast.innerText="Upload Failed";
    toast.style.background="#ef4444";
    toast.style.display="block";
  }
};

/* =========================
   PROGRESS BAR
========================= */

function showProgress(item){

  const statusColumns = [
    "color_mm02nvg7",
    "color_mm02f6sk",
    "color_mm02w1nr",
    "color_mm02wex8",
    "color_mm0282sv",
    "color_mm02fvcg",
    "color_mm0260zc",
    "color_mm02fjyq",
    "color_mm02kpx9",
    "color_mm02rh5m",
    "color_mm02sw49",
    "color_mm025cqk",
    "color_mm02n84j",
    "color_mm02tp34",
    "color_mm02m91t",
    "color_mm02mqdj"
  ];

  let completed = 0;

  item.column_values.forEach(col=>{
    if(statusColumns.includes(col.id)){
      if(col.text && 
        (col.text.includes("✓") || 
         col.text.toLowerCase().includes("done"))){
        completed++;
      }
    }
  });

  const total = statusColumns.length;
  const percent = (completed / total) * 100;

  document.getElementById("progressBar").style.width =
    percent + "%";

  document.getElementById("counts").innerText =
    `${completed} completed • ${total-completed} pending`;
}

/* =========================
   DOCUMENT STATUS UI
========================= */

function updateDocStatuses(item){

  const cards = Array.from(document.querySelectorAll(".docCard"));
  let completed = 0;

  cards.forEach(card=>{

    card.classList.remove("completed");

    const colId = card.dataset.col;
    const badge = card.querySelector(".statusBadge");
    const fileInput = card.querySelector("input[type=file]");

    const column = item.column_values.find(c=>c.id===colId);
    if(!column) return;

    const done =
      column.text &&
      (column.text.includes("✓") ||
       column.text.toLowerCase().includes("done"));

    if(done){

      completed++;

      badge.innerText = "Uploaded";
      badge.className = "statusBadge done";

      card.classList.add("completed");
      if(fileInput) fileInput.style.display="none";

    }else{

      badge.innerText = "Pending";
      badge.className = "statusBadge pending";

      if(fileInput) fileInput.style.display="block";
    }
  });

  const total = cards.length;
  document.getElementById("counts").innerText =
    `${completed} completed • ${total-completed} pending`;

  if(completed===total){
    showAllDoneBanner();
  }
}

  // Sort pending first
  const container = document.getElementById("docList");
  const sorted = rows.sort((a,b)=>{
    return a.classList.contains("completed") -
           b.classList.contains("completed");
  });

  sorted.forEach(r=>container.appendChild(r));

  // If everything done
  if(completed === rows.length){
    showAllDoneBanner();
  }
}}

function showAllDoneBanner(){

  if(document.getElementById("doneBanner")) return;

  const banner = document.createElement("div");
  banner.id = "doneBanner";
  banner.innerText = "All documents complete ✓";
  banner.style.background = "#22c55e";
  banner.style.color = "white";
  banner.style.padding = "12px";
  banner.style.marginBottom = "10px";
  banner.style.borderRadius = "8px";
  banner.style.textAlign = "center";

  document.querySelector(".card")
    .prepend(banner);
}
