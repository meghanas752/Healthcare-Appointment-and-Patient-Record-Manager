const express = require("express");
const router = express.Router();
const db = require("../db/db");

// 🧾 Get all inventory items
router.get("/inventory", (req, res) => {
  db.query("SELECT * FROM inventory_items ORDER BY drug_name", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 🩺 Dispense medicine
router.post("/dispense", (req, res) => {
  const { drug_code, qty, ref_id } = req.body;
  if (!drug_code || !qty)
    return res.status(400).send("Missing drug_code or qty.");

  db.beginTransaction((err) => {
    if (err) return res.status(500).send(err);

    // Step 1: reduce stock
    db.query(
      "UPDATE inventory_items SET stock = stock - ? WHERE drug_code = ? AND stock >= ?",
      [qty, drug_code, qty],
      (err, result) => {
        if (err) return db.rollback(() => res.status(500).send(err));
        if (result.affectedRows === 0)
          return db.rollback(() =>
            res.status(400).send("Insufficient stock or invalid drug code.")
          );

        // Step 2: log movement
        db.query(
          "INSERT INTO inventory_moves (drug_code, qty, reason, ref_type, ref_id) VALUES (?, ?, 'DISPENSE', 'PRESCRIPTION', ?)",
          [drug_code, qty, ref_id || null],
          (err) => {
            if (err) return db.rollback(() => res.status(500).send(err));
            db.commit((err) => {
              if (err) return db.rollback(() => res.status(500).send(err));
              res.send("Dispensed successfully and stock updated.");
            });
          }
        );
      }
    );
  });
});

// 🔁 Restock medicine
router.post("/restock", (req, res) => {
  const { drug_code, qty } = req.body;
  if (!drug_code || !qty)
    return res.status(400).send("Missing drug_code or qty.");

  db.beginTransaction((err) => {
    if (err) return res.status(500).send(err);

    // Step 1: increase stock
    db.query(
      "UPDATE inventory_items SET stock = stock + ? WHERE drug_code = ?",
      [qty, drug_code],
      (err, result) => {
        if (err) return db.rollback(() => res.status(500).send(err));
        if (result.affectedRows === 0)
          return db.rollback(() =>
            res.status(400).send("Invalid drug code.")
          );

        // Step 2: log restock movement
        db.query(
          "INSERT INTO inventory_moves (drug_code, qty, reason, ref_type) VALUES (?, ?, 'RESTOCK', 'MANUAL')",
          [drug_code, qty],
          (err) => {
            if (err) return db.rollback(() => res.status(500).send(err));
            db.commit((err) => {
              if (err) return db.rollback(() => res.status(500).send(err));
              res.send("Restocked successfully and inventory updated.");
            });
          }
        );
      }
    );
  });
});

module.exports = router;
  