import express from "express";
import { createOrUpdateJournal, getUserJournals, getJournalByDate } from "../controllers/journalController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createOrUpdateJournal);
router.get("/", verifyToken, getUserJournals);
router.get("/:date", verifyToken, getJournalByDate);

export default router;
