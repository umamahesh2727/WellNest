import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getDailyAnalytics,
  getMonthlyAnalytics,
  getYearlyAnalytics,
  getSummaryForDate,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/weekly", verifyToken, getDailyAnalytics);
router.get("/monthly", verifyToken, getMonthlyAnalytics);
router.get("/yearly", verifyToken, getYearlyAnalytics);
router.get("/summary", verifyToken, getSummaryForDate);

export default router;
