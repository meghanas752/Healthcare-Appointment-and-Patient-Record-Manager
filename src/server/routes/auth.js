// HMPRS-15 scaffold only
import { Router } from "express";
import * as authService from "../services/authService.js";
const router = Router();

router.post("/login", async (req, res) => {
  // later: call authService.login(...)
  return res.status(501).json({ ok: false, msg: "Not implemented (lockout flow TBD)" });
});

export default router;
