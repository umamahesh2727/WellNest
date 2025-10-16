import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/test", verifyToken, (req, res) => {
  res.json({ message: `Welcome, user ID: ${req.user.id}` });
});

export default router;
