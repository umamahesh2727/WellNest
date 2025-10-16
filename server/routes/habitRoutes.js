import express from "express";
import {
  createHabit,
  getUserHabits,
  deleteHabit,
  updateHabitCompletion,
} from "../controllers/habitController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createHabit);
router.get("/", verifyToken, getUserHabits);
router.delete("/:id", verifyToken, deleteHabit);
router.patch("/:id", verifyToken, updateHabitCompletion);

export default router;
