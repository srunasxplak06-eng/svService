const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static frontend
app.use("/", express.static("public"));

// สร้างออเดอร์ใหม่
app.post("/api/orders", (req, res) => {
  const { customerName, phone, address, items, total } = req.body;
  if (!customerName || !items) {
    return res.status(400).json({ error: "ข้อมูลไม่ครบ" });
  }
  const itemsStr = JSON.stringify(items);
  const sql = `INSERT INTO orders (customerName, phone, address, items, total) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [customerName, phone || "", address || "", itemsStr, total || 0], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, orderId: this.lastID });
  });
});

// ดึงออเดอร์ทั้งหมด (admin)
app.get("/api/orders", (req, res) => {
  const sql = `SELECT * FROM orders ORDER BY created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // parse items
    rows = rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    res.json(rows);
  });
});

// ดูออเดอร์เดียว
app.get("/api/orders/:id", (req, res) => {
  const sql = `SELECT * FROM orders WHERE id = ?`;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "ไม่พบออเดอร์" });
    row.items = JSON.parse(row.items);
    res.json(row);
  });
});

// อัปเดตสถานะ (admin)
app.patch("/api/orders/:id", (req, res) => {
  const { status } = req.body;
  const sql = `UPDATE orders SET status = ? WHERE id = ?`;
  db.run(sql, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, changes: this.changes });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
