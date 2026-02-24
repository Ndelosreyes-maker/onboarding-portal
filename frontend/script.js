const API = "https://onboarding-portal-hy2o.onrender.com";

const portalInput = document.getElementById("portalId");

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
  document.getElementById("employeeName").innerText =
    "Employee: " + item.name;

  const fileColumns = [
    "file_mm02syqk",
    "file_mm027d47",
    "file_mm02dgx5",
    "file_mm02vxj1",
    "file_mm02wc6g",
    "file_mm02tfs6",
    "file_mm02q4hg",
    "file_mm02xndg",
    "file_mm02b5af",
    "file_mm02nz2j",
    "file_mm02g17x",
    "file_mm02cpd1",
    "file_mm023e5h",
    "file_mm028qz9",
    "file_mm02n1k4",
    "file_mm025qv4"
  ];

  let done = 0;

  item.column_values.forEach(col=>{
    if(fileColumns.includes(col.id) && col.value){
      done++;
    }
  });

  const percent = (done / fileColumns.length) * 100;
  document.getElementById("progressBar").style.width = percent + "%";
}
