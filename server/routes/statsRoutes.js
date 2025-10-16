import express from "express";
import { getStats } from "../controllers/statsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getStats);

export default router;
