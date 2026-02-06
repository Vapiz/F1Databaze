const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "..", "data", "champions.json");

function loadUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw) || [];
  } catch (e) { return []; }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

module.exports = {
  getAll: () => loadUsers(),
  getById: (id) => loadUsers().find((u) => u.id === id) || null,
  create: ({ jmeno, tym, tituly, stat }) => {
    const users = loadUsers();
    const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const user = { id: newId, jmeno, tym, tituly: Number(tituly), stat };
    users.push(user);
    saveUsers(users);
    return user;
  },
  update: (id, patch) => {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...patch };
    saveUsers(users);
    return users[idx];
  },
  remove: (id) => {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const removed = users.splice(idx, 1)[0];
    saveUsers(users);
    return removed;
  }
};