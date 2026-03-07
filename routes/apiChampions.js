const store = require("../storage/championsStore");

/* ========================================= */
/* POMOCNÉ FUNKCE PRO PRÁCI S DATY           */
/* ========================================= */

function readBodyJson(req, cb) {
  let body = "";
  // node js prijima data po malych kouscich takze si je postupne lepi dohromady
  req.on("data", (ch) => (body += ch));
  req.on("end", () => {
    // az data dotečou prevede ten text na pouzitelny objekt
    try { cb(null, JSON.parse(body || "{}")); } catch (e) { cb(e); }
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApiChampions(req, res) {
  
  /* ========================================= */
  /* ZÍSKÁNÍ DAT A FILTRACE (GET)              */
  /* CESTA: /api/champions                     */
  /* ========================================= */
  if (req.url.startsWith("/api/champions") && req.method === "GET") {
    let items = store.getAll();
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    
    // vytahne vsechny parametry z url adresy
    const search = urlObj.searchParams.get("search") || "";
    const filterTym = urlObj.searchParams.get("tym") || "";
    const minTituly = urlObj.searchParams.get("minTituly") || "";

    // vyfiltruje data podle toho co uzivatel zadal
    if (search) items = items.filter(i => i.jmeno.toLowerCase().includes(search.toLowerCase()) || i.tym.toLowerCase().includes(search.toLowerCase()));
    if (filterTym) items = items.filter(i => i.tym === filterTym);
    if (minTituly) items = items.filter(i => i.tituly >= Number(minTituly));

    return sendJson(res, 200, items);
  }

  /* ========================================= */
  /* VYTVOŘENÍ NOVÉHO JEZDCE (POST)            */
  /* CESTA: /api/champions                     */
  /* ========================================= */
  if (req.url === "/api/champions" && req.method === "POST") {
    return readBodyJson(req, (err, data) => {
      const created = store.create(data);
      return sendJson(res, 201, created);
    });
  }

  /* ========================================= */
  /* SMAZÁNÍ JEZDCE (DELETE)                   */
  /* CESTA: /api/champions/:id                 */
  /* ========================================= */
  if (req.url.startsWith("/api/champions/") && req.method === "DELETE") {
    // rozsekne url adresu podle lomitek a vytahne z ni to treti slovo coz je id jezdce
    const id = Number(req.url.split("/")[3]);
    const removed = store.remove(id);
    return sendJson(res, 200, { message: "Smazáno", removed });
  }

  /* ========================================= */
  /* ÚPRAVA JEZDCE (PUT)                       */
  /* CESTA: /api/champions/:id                 */
  /* ========================================= */
  if (req.url.startsWith("/api/champions/") && req.method === "PUT") {
    const id = Number(req.url.split("/")[3]);
    return readBodyJson(req, (err, data) => {
      const updated = store.update(id, data);
      return sendJson(res, 200, updated);
    });
  }

  return false;
}

module.exports = { handleApiChampions };