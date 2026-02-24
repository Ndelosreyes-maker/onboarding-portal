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

  const res = await fetch("https://onboarding-portal-hy20.onrender.com/upload", {
    method:"POST",
    body:formData
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
