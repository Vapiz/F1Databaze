const fs = require("fs");
const path = require("path");

// Cesta k JSON souboru ve složce data
const FILE_PATH = path.join(__dirname, "..", "data", "champions.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
  } catch (e) { return []; }
}

function save(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
  getAll: () => load(),
  getById: (id) => load().find(c => c.id === Number(id)) || null,
  create: (item) => {
    const data = load();
    const newId = data.length ? Math.max(...data.map(c => c.id)) + 1 : 1;
    const newItem = { 
      id: newId, 
      jmeno: item.jmeno, 
      tym: item.tym, 
      tituly: Number(item.tituly), 
      stat: item.stat 
    };
    data.push(newItem);
    save(data);
    return newItem;
  },
  remove: (id) => {
    const data = load();
    const filtered = data.filter(c => c.id !== Number(id));
    save(filtered);
    return true;
  }
};