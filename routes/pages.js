const fs = require("fs");
const path = require("path");
const store = require("../storage/championsStore");

const VIEWS_DIR = path.join(__dirname, "..", "views");

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

function handlePages(req, res) {
  // GET / (Hlavní stránka)
  if (req.url === "/" && req.method === "GET") {
    const items = store.getAll();
    const rows = items.map(i => `
      <tr>
        <td>${i.id}</td>
        <td><a href="/item/${i.id}">${i.jmeno}</a></td>
        <td>${i.tym}</td>
        <td>
          <a href="/edit/${i.id}">Upravit</a>
          <button data-delete-id="${i.id}">Smazat</button>
        </td>
      </tr>`).join("");

    const indexTpl = loadView("index.html");
    const content = render(indexTpl, { rows: rows || "<tr><td colspan='4'>Žádná data</td></tr>" });
    return sendHtml(res, renderLayout({ title: "F1 Šampioni", content }));
  }

  // GET /edit/:id 
  if (req.url.startsWith("/edit/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const item = store.getById(id);
    const content = render(loadView("edit.html"), item);
    return sendHtml(res, renderLayout({ title: "Editace", content }));
  }

  // GET /item/:id [cite: 16]
  if (req.url.startsWith("/item/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const item = store.getById(id);
    const content = render(loadView("detail.html"), item);
    return sendHtml(res, renderLayout({ title: "Detail", content }));
  }

  return false;
}

module.exports = { handlePages };