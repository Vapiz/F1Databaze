/* ========================================= */
/* SPUŠTĚNÍ SERVERU A NASMĚROVÁNÍ POŽADAVKŮ  */
/* ========================================= */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleApiChampions } = require("./routes/apiChampions");
const { handlePages } = require("./routes/pages");

const server = http.createServer((req, res) => {
  
  /* ========================================= */
  /* OBSLUHA STATICKÝCH SOUBORŮ                */
  /* Zde prohlížeči posíláme vzhled a logiku   */
  /* ========================================= */
  if (req.url === "/style.css") {
    res.writeHead(200, { "Content-Type": "text/css" });
    // precte cssko ze slozky public a posle ho prohlizeci
    return res.end(fs.readFileSync(path.join(__dirname, "public", "style.css")));
  }
  if (req.url === "/app.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    // precte javascript pro prohlizec ze slozky public a posle ho
    return res.end(fs.readFileSync(path.join(__dirname, "public", "app.js")));
  }

  /* ========================================= */
  /* SMĚROVÁNÍ NA API NEBO VYKRESLENÍ HTML     */
  /* ========================================= */
  // predame ty pozadavky na routy a pokud je umi zpracovat zastavime se tu
  if (handleApiChampions(req, res) !== false) return;
  if (handlePages(req, res) !== false) return;

  // pokud uzivatel zada url kterou nezname (napr /ahoj) hodime mu chybu ze to neexistuje
  res.writeHead(404);
  res.end("Not Found");
});


// spusti server a zahlasi start zavodu
server.listen(3000, () => console.log("🚥 Zhasla červená světla a server odstartoval na http://localhost:3000 ! 🏎️"));