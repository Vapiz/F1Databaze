// Importy a nastavení
const fs = require("fs");
const path = require("path");
const store = require("../storage/championsStore");

const VIEWS_DIR = path.join(__dirname, "..", "views");

// Pomocné funkce pro renderování šablon
function loadView(name) { return fs.readFileSync(path.join(VIEWS_DIR, name), "utf-8"); }

function render(template, vars) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) { out = out.replaceAll(`{{${k}}}`, String(v)); }
  return out;
}

function renderLayout({ title, content }) {
  const layout = loadView("layout.html");
  return render(layout, { title, content });
}

function sendHtml(res, html, status = 200) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

// Hlavní zpracování stránek (Routy)
function handlePages(req, res) {
  const baseURL = `http://${req.headers.host || "localhost"}`;
  const urlObj = new URL(req.url, baseURL);

  // GET / (Hlavní stránka a filtrace)
  if (urlObj.pathname === "/" && req.method === "GET") {
    let items = store.getAll();
    const search = urlObj.searchParams.get("search");

    if (search) {
      const hledanyText = search.toLowerCase();
      items = items.filter(i => 
        i.jmeno.toLowerCase().includes(hledanyText) || 
        i.tym.toLowerCase().includes(hledanyText)
      );
    }

    const rows = items.map(i => {
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
      </tr>`
    }).join("");

    const indexTpl = loadView("index.html");
    const content = render(indexTpl, { rows: rows || "<tr><td colspan='4'>Žádná data nebyla nalezena</td></tr>" });
    return sendHtml(res, renderLayout({ title: "F1 Šampioni", content }));
  }

  // GET /edit/:id (Stránka úpravy)
  if (req.url.startsWith("/edit/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const item = store.getById(id);
    
    if (!item) {
      const errorHtml = loadView("error.html");
      return sendHtml(res, renderLayout({ title: "Nenalezeno", content: errorHtml }), 404);
    }

    const content = render(loadView("edit.html"), item);
    return sendHtml(res, renderLayout({ title: "Editace", content }));
  }

  // GET /item/:id (Detail šampiona)
  if (req.url.startsWith("/item/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const item = store.getById(id);
    
    if (!item) {
      const errorHtml = loadView("error.html");
      return sendHtml(res, renderLayout({ title: "Nenalezeno", content: errorHtml }), 404);
    }

    item.fotkaHtml = item.fotka ? `<img src="${item.fotka}" class="avatar-large" alt="Foto jezdce">` : '';

    const content = render(loadView("detail.html"), item);
    return sendHtml(res, renderLayout({ title: "Detail", content }));
  }

  return false;
}

module.exports = { handlePages };