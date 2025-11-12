import { Router } from "express";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/users  (admin only)
router.get("/", authenticate, requireRole("admin"), async (_req, res) => {
  const users = await User.find({}, "username roles createdAt");
  res.json({ data: users });
});

export default router;
