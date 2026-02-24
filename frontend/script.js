
document.getElementById("uploadForm").addEventListener("submit", async e=>{
  e.preventDefault();

  const formData = new FormData(e.target);

  const res = await fetch("https://YOUR-RENDER-URL.onrender.com/upload", {
    method:"POST",
    body:formData
  });

  const data = await res.text();
  document.getElementById("msg").innerText = data;
});
