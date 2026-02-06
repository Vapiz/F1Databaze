const store = require("../storage/championsStore");

function readBodyJson(req, cb) {
  let body = "";
  req.on("data", (ch) => (body += ch));
  req.on("end", () => {
    try { cb(null, JSON.parse(body || "{}")); } catch (e) { cb(e); }
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApiChampions(req, res) {
  // GET /api/champions - Seznam s filtrací [cite: 15, 29]
  if (req.url.startsWith("/api/champions") && req.method === "GET") {
    let items = store.getAll();
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const search = urlObj.searchParams.get("search");

    if (search) {
      items = items.filter(i => i.jmeno.toLowerCase().includes(search.toLowerCase()) || i.tym.toLowerCase().includes(search.toLowerCase()));
    }
    return sendJson(res, 200, items);
  }

  // POST /api/champions - Vytvoření [cite: 17]
  if (req.url === "/api/champions" && req.method === "POST") {
    return readBodyJson(req, (err, data) => {
      const created = store.create(data);
      return sendJson(res, 201, created);
    });
  }

  // DELETE /api/champions/:id - Smazání [cite: 20]
  if (req.url.startsWith("/api/champions/") && req.method === "DELETE") {
    const id = Number(req.url.split("/")[3]);
    const removed = store.remove(id);
    return sendJson(res, 200, { message: "Smazáno", removed });
  }

  // PUT /api/champions/:id - Editace [cite: 19]
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