/* ========================================= */
/* POMOCNÉ FUNKCE PRO API A OBRÁZKY          */
/* ========================================= */

async function api(cesta, moznosti) {
  // posle pozadavek na server a ceka na odpoved
  const res = await fetch(cesta, {
    headers: { "Content-Type": "application/json" },
    ...moznosti,
  });
  const data = await res.json();
  // pokud server vrati chybu (napriklad 404 nebo 500) rovnou to hodi error
  if (!res.ok) throw { status: res.status, data };
  return data;
}

function nahratObrazek(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    // precte nahranou fotku a prevede ji na dlouhy textovy retezec (base64)
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/* ========================================= */
/* PŘIDÁNÍ ŠAMPIONA DO DATABÁZE (POST)       */
/* ========================================= */

const formPridat = document.getElementById("createForm");
if (formPridat) {
  formPridat.addEventListener("submit", async (e) => {
    // zabrani strance aby se po kliknuti na tlacitko zbytecne obnovila
    e.preventDefault();
    
    // vycucne vsechna data z formulare do jednoho baliku
    const fd = new FormData(formPridat);
    const fileInput = formPridat.querySelector('input[name="fotka"]');
    
    const payload = { 
        jmeno: fd.get("jmeno"), 
        tym: fd.get("tym"), 
        tituly: Number(fd.get("tituly")), // prevede textove cislo na realne cislo pro databazi
        stat: fd.get("stat")
    };

    if (payload.jmeno.toLowerCase().includes("lando norris")) {
        const msg = document.getElementById("createMsg");
        msg.textContent = "Přístup odepřen: Lando Norris zde není povolen! :)";
        msg.style.color = "var(--danger)";
        return; // okamzite zastavi cely proces a formular se neodesle
    }

    if (fileInput && fileInput.files.length > 0) {
        payload.fotka = await nahratObrazek(fileInput.files[0]);
    }

    try {
      await api("/api/champions", { method: "POST", body: JSON.stringify(payload) });
      window.location.reload(); // po uspesnem ulozeni refreshne stranku
    } catch (err) {
      document.getElementById("createMsg").textContent = "Chyba: " + (err.data?.error || "Nepodařilo se uložit");
    }
  });
}

/* ========================================= */
/* MAZÁNÍ ŠAMPIONA Z DATABÁZE (DELETE)       */
/* ========================================= */

document.addEventListener("click", async (e) => {
  // najde tlacitko na ktere uzivatel kliknul a zjisti jestli ma v sobe delete-id
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

/* ========================================= */
/* ÚPRAVA EXISTUJÍCÍHO ŠAMPIONA (PUT)        */
/* ========================================= */

const formUpravit = document.getElementById("editForm");
if (formUpravit) {
  formUpravit.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    // vytahne id jezdce primo z html znacky formulare
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

/* ========================================= */
/* LIVE FILTRACE BEZ OBNOVENÍ STRÁNKY (GET)  */
/* ========================================= */

const filterForm = document.querySelector(".filter-bar");
const tableBody = document.querySelector("tbody");

if (filterForm && tableBody) {
  filterForm.addEventListener("submit", async (e) => {
    // zabrani klasickemu odeslani formulare ktere by obnovilo stranku
    e.preventDefault(); 

    const fd = new FormData(filterForm);
    
    // sestavi url adresu pro api s parametry z policek
    const params = new URLSearchParams({
      search: fd.get("search") || "",
      tym: fd.get("tym") || "",
      minTituly: fd.get("minTituly") || ""
    });

    try {
      // tise stahne vyfiltrovana data z naseho api bez bliknuti stranky
      const data = await api(`/api/champions?${params.toString()}`);

      // promaze starou tabulku a naplni ji novymi daty za zlomek vteriny
      if (data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='4'>Žádná data nebyla nalezena</td></tr>";
      } else {
        tableBody.innerHTML = data.map(i => {
          const fotkaUrl = i.fotka || `https://ui-avatars.com/api/?name=${i.jmeno}&background=2b2b35&color=fff`;
          return `
          <tr>
            <td>${i.id}</td>
            <td>
              <div class="jmeno-wrapper">
                <img src="${fotkaUrl}" class="avatar-small" alt="Foto">
                <a href="/item/${i.id}">${i.jmeno}</a>
              </div>
            </td>
            <td>${i.tym}</td>
            <td>
              <div class="actions" style="margin: 0;">
                <a href="/edit/${i.id}" class="btn btn-upravit">Upravit</a>
                <button data-delete-id="${i.id}" class="btn-danger">Smazat</button>
              </div>
            </td>
          </tr>`;
        }).join("");
      }
    } catch (err) {
      alert("Chyba při filtraci: " + (err.data?.error || "Neznámá chyba"));
    }
  });
}