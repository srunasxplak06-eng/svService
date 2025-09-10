const sqlite3 = require("sqlite3").verbose();
const DBSOURCE = "orders.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log("Connected to SQLite database.");
});

const initSql = `
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerName TEXT,
  phone TEXT,
  address TEXT,
  items TEXT, -- JSON string: [{id,name,qty,price},...]
  total REAL,
  status TEXT DEFAULT 'รอชำระ/รอรับคำสั่ง',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.serialize(() => {
  db.run(initSql);
});

module.exports = db;
