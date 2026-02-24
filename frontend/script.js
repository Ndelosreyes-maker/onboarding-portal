
document.getElementById("uploadForm").addEventListener("submit", async e=>{
  e.preventDefault();

  const formData = new FormData(e.target);

  const res = await fetch("http://localhost:3000/upload",{
    method:"POST",
    body:formData
  });

  const data = await res.text();
  document.getElementById("msg").innerText = data;
});
