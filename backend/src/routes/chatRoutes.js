import express from "express";
import {
  sendMessage,
  streamMessage,
  getPersonalities,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Send message to AI
router.post("/message", sendMessage);

// Stream message (real-time response)
router.post("/stream", streamMessage);

// Get available AI personalities
router.get("/personalities", getPersonalities);

export default router;
