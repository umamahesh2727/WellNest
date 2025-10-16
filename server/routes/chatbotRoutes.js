import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { chatWithAssistant } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/", verifyToken, chatWithAssistant);

export default router;
