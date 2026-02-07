import express from "express";
import {
  getConversations,
  getConversation,
  createConversation,
  addMessage,
  updateConversation,
  deleteConversation,
  generateTitle,
  shareConversation,
  unshareConversation,
  getSharedConversation,
} from "../controllers/control.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ==================== PUBLIC ROUTE (NO AUTH) ====================
// This must come BEFORE router.use(protect) so it stays public
router.get("/share/:shareId", getSharedConversation);

// ==================== PROTECTED ROUTES (AUTH REQUIRED) ====================
// All routes below require authentication
router.use(protect);

router.route("/").get(getConversations).post(createConversation);

router
  .route("/:id")
  .get(getConversation)
  .put(updateConversation)
  .delete(deleteConversation);

router.post("/:id/messages", addMessage);
router.post("/:id/generate-title", generateTitle);

// ==================== SHARE ROUTES (NEW) ====================
router.post("/:id/share", shareConversation);
router.delete("/:id/share", unshareConversation);

export default router;
