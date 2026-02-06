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

// PŘIDÁNÍ ŠAMPIONA (POST /api/champions)
const formPridat = document.getElementById("createForm");
if (formPridat) {
  formPridat.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(formPridat);
    
    // Sestavení dat pro F1 šampiona (Požadavek 10)
    const payload = { 
        jmeno: fd.get("jmeno"), 
        tym: fd.get("tym"), 
        tituly: Number(fd.get("tituly")),
        stat: fd.get("stat")
    };

    try {
      await api("/api/champions", { method: "POST", body: JSON.stringify(payload) });
      window.location.reload(); // Obnoví stránku, aby se ukázal nový jezdec
    } catch (err) {
      document.getElementById("createMsg").textContent = "Chyba: " + (err.data.error || "Nepodařilo se uložit");
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
    window.location.reload();
  } catch (err) {
    alert("Chyba při mazání: " + JSON.stringify(err.data));
  }
});