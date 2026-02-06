const store = require("../storage/championsStore");

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApiChampions(req, res) {
  // GET /api/champions - Seznam s filtrací
  if (req.url.startsWith("/api/champions") && req.method === "GET") {
    let data = store.getAll();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const hledat = url.searchParams.get("search");

    if (hledat) { // Filtrace podle jména nebo týmu [cite: 31, 32]
      data = data.filter(c => 
        c.jmeno.toLowerCase().includes(hledat.toLowerCase()) || 
        c.tym.toLowerCase().includes(hledat.toLowerCase())
      );
    }
    return sendJson(res, 200, data);
  }

  // DELETE /api/champions/:id - Mazání záznamu [cite: 20]
  if (req.url.startsWith("/api/champions/") && req.method === "DELETE") {
    const id = req.url.split("/")[3];
    store.remove(id);
    return sendJson(res, 200, { message: "Smazáno" });
  }

  return false;
}

module.exports = { handleApiChampions };