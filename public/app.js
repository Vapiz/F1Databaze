// Pomocná funkce pro komunikaci s API
async function api(cesta, moznosti) {
  const res = await fetch(cesta, {
    headers: { "Content-Type": "application/json" },
    ...moznosti,
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// Pomocná funkce pro převod obrázku (Base64)
function nahratObrazek(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// PŘIDÁNÍ ŠAMPIONA (POST /api/champions)
const formPridat = document.getElementById("createForm");
if (formPridat) {
  formPridat.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(formPridat);
    const fileInput = formPridat.querySelector('input[name="fotka"]');
    
    const payload = { 
        jmeno: fd.get("jmeno"), 
        tym: fd.get("tym"), 
        tituly: Number(fd.get("tituly")),
        stat: fd.get("stat")
    };

    if (payload.jmeno.toLowerCase().includes("lando norris")) {
        const msg = document.getElementById("createMsg");
        msg.textContent = "Přístup odepřen: Lando Norris zde není povolen! :)";
        msg.style.color = "var(--danger)";
        return; 
    }

    if (fileInput && fileInput.files.length > 0) {
        payload.fotka = await nahratObrazek(fileInput.files[0]);
    }

    try {
      await api("/api/champions", { method: "POST", body: JSON.stringify(payload) });
      window.location.reload(); 
    } catch (err) {
      document.getElementById("createMsg").textContent = "Chyba: " + (err.data?.error || "Nepodařilo se uložit");
    }
  });
}

// MAZÁNÍ ŠAMPIONA (DELETE /api/champions/:id)
document.addEventListener("click", async (e) => {
  const tlacitko = e.target.closest("[data-delete-id]");
  if (!tlacitko) return;

  const id = tlacitko.dataset.deleteId;
  if (!confirm(`Opravdu chcete smazat šampiona s ID ${id}?`)) return;

  try {
    await api(`/api/champions/${id}`, { method: "DELETE" });
    window.location.href = "/";
  } catch (err) {
    alert("Chyba při mazání: " + JSON.stringify(err.data));
  }
});

// ÚPRAVA ŠAMPIONA (PUT /api/champions/:id)
const formUpravit = document.getElementById("editForm");
if (formUpravit) {
  formUpravit.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    const id = formUpravit.dataset.id; 
    const fd = new FormData(formUpravit);
    const fileInput = formUpravit.querySelector('input[name="fotka"]');
    
    const payload = { 
        jmeno: fd.get("jmeno"), 
        tym: fd.get("tym"), 
        tituly: Number(fd.get("tituly")),
        stat: fd.get("stat")
    };

    if (payload.jmeno.toLowerCase().includes("lando norris")) {
        const msg = document.getElementById("editMsg");
        msg.textContent = "Zákaz: Landa Norrise sem nenapašuješ!";
        msg.style.color = "var(--danger)";
        return; 
    }

    if (fileInput && fileInput.files.length > 0) {
        payload.fotka = await nahratObrazek(fileInput.files[0]);
    }

    try {
      await api(`/api/champions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      window.location.href = "/"; 
    } catch (err) {
      document.getElementById("editMsg").textContent = "Chyba: " + (err.data?.error || "Nepodařilo se upravit");
    }
  });
}