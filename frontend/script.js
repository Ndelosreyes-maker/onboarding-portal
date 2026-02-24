const API = "https://onboarding-portal-hy2o.onrender.com";

const portalInput = document.getElementById("portalId");
const profileResult = document.getElementById("profileResult");
const portalScreen = document.getElementById("portalScreen");
const searchScreen = document.getElementById("searchScreen");

portalInput.addEventListener("blur", async () => {

  const portalId = portalInput.value.trim();
  if (!portalId) return;

  const response = await fetch(`${API}/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portalId })
  });

  if (!response.ok) return;

  const item = await response.json();

  window.cachedItem = item;
  window.cachedPortalId = portalId;

  profileResult.innerHTML = `
    <div class="profileCard" onclick="openPortal()">
      ${item.name}
    </div>
  `;
});

function openPortal(){
  searchScreen.style.display = "none";
  portalScreen.style.display = "block";

  document.getElementById("employeeName").innerText =
    window.cachedItem.name;

  showProgress(window.cachedItem);
  updateDocStatuses(window.cachedItem);
}

const modal = document.getElementById("modal");
const submitBtn = document.getElementById("submitBtn");
const confirmBtn = document.getElementById("confirmBtn");
const cancelBtn = document.getElementById("cancelBtn");
const toast = document.getElementById("toast");

submitBtn.onclick = () => modal.style.display = "flex";
cancelBtn.onclick = () => modal.style.display = "none";

confirmBtn.onclick = async () => {

  modal.style.display = "none";

  const formData = new FormData();
  formData.append("portalId", window.cachedPortalId);

  formData.append("physicalExp", document.getElementById("physicalExp").value);
  formData.append("liabilityExp", document.getElementById("liabilityExp").value);
  formData.append("registrationExp", document.getElementById("registrationExp").value);

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
    toast.innerText="Documents Uploaded Successfully";
    toast.style.display="block";
    setTimeout(()=>toast.style.display="none",3000);
  } else {
    toast.innerText="Upload Failed";
    toast.style.background="#ef4444";
    toast.style.display="block";
  }
};

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
      if(col.text && (col.text.includes("✓") || col.text.toLowerCase().includes("done"))){
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

function updateDocStatuses(item){

  const rows = Array.from(document.querySelectorAll(".docRow"));

  let completed = 0;

  rows.forEach(row=>{
    const colId = row.dataset.col;
    const statusEl = row.querySelector(".status");
    const fileInput = row.querySelector("input[type=file]");

    const column = item.column_values.find(c=>c.id===colId);
    if(!column) return;

    const done =
      column.text &&
      (column.text.includes("✓") ||
       column.text.toLowerCase().includes("done"));

    if(done){
      completed++;

      statusEl.innerText = "✓ Uploaded";
      statusEl.style.color = "#22c55e";

      if(fileInput) fileInput.style.display = "none";
      row.classList.add("completed");

    }else{
      statusEl.innerText = "Pending";
      statusEl.style.color = "#f59e0b";

      if(fileInput) fileInput.style.display = "inline-block";
      row.classList.add("pending");
    }
  });

  // sort pending to top
  const container = document.getElementById("docList");
  const sorted = rows.sort((a,b)=>{
    return a.classList.contains("completed") -
           b.classList.contains("completed");
  });

  sorted.forEach(r=>container.appendChild(r));

  // banner if all done
  if(completed === rows.length){
    showAllDoneBanner();
  }
}

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
