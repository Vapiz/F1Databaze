/* ========================================= */
/* IMPORTY A NASTAVENÍ CESTY K DATABÁZI      */
/* ========================================= */
const fs = require("fs");
const path = require("path");

// namiri presne na soubor champions.json ve slozce data kde jsou vsichni jezdci
const USERS_FILE = path.join(__dirname, "..", "data", "champions.json");

/* ========================================= */
/* POMOCNÉ FUNKCE PRO ČTENÍ A ZÁPIS          */
/* ========================================= */

function loadUsers() {
  try {
    // precte ten json soubor jako obyc text a pokusi se z nej udelat javascript pole
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw) || [];
  } catch (e) { return []; } // kdyby soubor neexistoval nebo v nem byla chyba vrati ciste pole
}

function saveUsers(users) {
  // vezme javascript pole a hodi ho zpatky do json souboru v krasnem naformatovanem tvaru (diky te dvojce)
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

/* ========================================= */
/* HLAVNÍ FUNKCE PRO MANIPULACI S JEZDCI     */
/* ========================================= */

module.exports = {
  // Vráti všechny jezdce
  getAll: () => loadUsers(),
  
  // Najde jednoho konkrétního podle ID
  getById: (id) => loadUsers().find((u) => u.id === id) || null,
  
  // Vytvoří nového jezdce
  create: ({ jmeno, tym, tituly, stat }) => {
    const users = loadUsers();
    // prohleda vsechny id a priradi dalsi cislo v poradi (aby se neopakovaly)
    const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const user = { id: newId, jmeno, tym, tituly: Number(tituly), stat };
    users.push(user);
    saveUsers(users);
    return user;
  },
  
  // Upraví existujícího jezdce
  update: (id, patch) => {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === id); // zjisti na jake pozici v poli ten jezdec stoji
    if (idx === -1) return null;
    // vezme stara data a prepise je tema novyma co zrovna prisly (diky treem teckam)
    users[idx] = { ...users[idx], ...patch };
    saveUsers(users);
    return users[idx];
  },
  
  // Smaže existujícího jezdce
  remove: (id) => {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    // vyrve toho jednoho jezdce z pole ven a zbytek necha
    const removed = users.splice(idx, 1)[0];
    saveUsers(users);
    return removed;
  }
};