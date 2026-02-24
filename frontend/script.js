const API = "https://onboarding-portal-hy2o.onrender.com";

const portalInput = document.getElementById("portalId");

portalInput.addEventListener("blur", async () => {
  const portalId = portalInput.value.trim();
  if (!portalId) return;

portalInput.addEventListener("blur", async () => {
  const portalId = portalInput.value.trim();
  if (!portalId) return;

  const res = await fetch(`${API}/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portalId })
  });

  if (!res.ok) return;

  const item = await res.json();

  document.getElementById("profileResult").innerHTML = `
    <div class="profileCard" onclick="openPortal('${portalId}')">
      ${item.name}
    </div>
  `;

  window.cachedItem = item;
});

  if (!res.ok) return;

  const item = await res.json();
  showProgress(item);
});

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
  formData.append("portalId", document.getElementById("portalId").value);
  formData.append("physicalExp", document.getElementById("physicalExp").value);
  formData.append("liabilityExp", document.getElementById("liabilityExp").value);
  formData.append("registrationExp", document.getElementById("registrationExp").value);

  document.querySelectorAll("input[type=file]").forEach(input=>{
    if(input.files[0]){
      formData.append(input.name, input.files[0]);
    }
  });

 const API = "https://onboarding-portal-hy2o.onrender.com";

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

  // show name immediately
  document.getElementById("employeeName").innerText =
    item.name;

  // THESE are your status columns
  const statusColumns = [
    "color_mm02nvg7", // SSN Stat
    "color_mm02f6sk", // PETS Stat
    "color_mm02w1nr", // Statewide Stat
    "color_mm02wex8", // I9 Stat
    "color_mm0282sv", // Physical Stat
    "color_mm02fvcg", // Liability Stat
    "color_mm0260zc", // Registration Stat
    "color_mm02fjyq", // Direct Deposit Stat
    "color_mm02kpx9", // W2 Stat
    "color_mm02rh5m", // TSSLD Stat
    "color_mm02sw49", // Medicaid Stat
    "color_mm025cqk", // P&P Stat
    "color_mm02n84j", // 4A Stat
    "color_mm02tp34", // 4B Stat
    "color_mm02m91t", // ID Stat
    "color_mm02mqdj"  // License Stat
  ];

  let completed = 0;

  item.column_values.forEach(col=>{
    if(statusColumns.includes(col.id)){
      if(col.text && col.text.toLowerCase().includes("done")){
        completed++;
      }
      if(col.text && col.text.includes("✓")){
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

function openPortal(){
  document.getElementById("searchScreen").style.display = "none";
  document.getElementById("portalScreen").style.display = "block";

  showProgress(window.cachedItem);
}
