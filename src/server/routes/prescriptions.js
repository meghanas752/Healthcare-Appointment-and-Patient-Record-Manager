import { Router } from "express";
import * as service from "../services/prescriptionsService.js";
const router = Router();

router.post("/", async (req, res) => {
  // scaffold only
  return res.status(201).json({ ok:true, id: 1, msg: "Prescription created (placeholder)" });
});

router.get("/:id", async (req, res) => {
  return res.json({ ok:true, prescription: { id: req.params.id } });
});

export default router;