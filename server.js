const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleApiChampions } = require("./routes/apiChampions");
const { handlePages } = require("./routes/pages");

const server = http.createServer((req, res) => {
  // Statické soubory (CSS, JS)
  if (req.url === "/style.css") {
    res.writeHead(200, { "Content-Type": "text/css" });
    return res.end(fs.readFileSync(path.join(__dirname, "public", "style.css")));
  }
  if (req.url === "/app.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    return res.end(fs.readFileSync(path.join(__dirname, "public", "app.js")));
  }

  if (handleApiChampions(req, res) !== false) return;
  if (handlePages(req, res) !== false) return;

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(3000, () => console.log("🏎️ Server běží na http://localhost:3000"));