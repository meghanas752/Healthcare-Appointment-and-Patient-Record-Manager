import { Router } from "express";
const router = Router();

// Scaffold endpoints (no real DB ops yet)
router.get("/", async (_req, res) => {
  // later: return list from inventory_items
  res.json({ ok:true, items: [] });
});

router.post("/dispense", async (req, res) => {
  // payload: { drug_code, qty, prescription_id }
  res.status(202).json({ ok:true, msg:"Dispense recorded (placeholder)" });
});

router.post("/restock", async (req, res) => {
  // payload: { drug_code, qty }
  res.status(202).json({ ok:true, msg:"Restock recorded (placeholder)" });
});

export default router;
