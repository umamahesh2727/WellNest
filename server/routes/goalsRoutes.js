import express from "express";
import {
  createOrUpdateGoals,
  getUserGoals,
  resetGoals,
} from "../controllers/goalsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getUserGoals);
router.post("/", verifyToken, createOrUpdateGoals);
router.delete("/", verifyToken, resetGoals);

export default router;
