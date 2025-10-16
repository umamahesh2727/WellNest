import express from "express";
import { createFoodLog, getUserFoodLogs, deleteFoodLog } from "../controllers/foodController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createFoodLog);
router.get("/", verifyToken, getUserFoodLogs);
router.delete("/:id", verifyToken, deleteFoodLog);

export default router;
