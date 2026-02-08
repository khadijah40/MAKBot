const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const jwt = require("jsonwebtoken");

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ success: false });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this",
    );
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false });
  }
};

// Get all chats
router.get("/all", auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).sort({
      updatedAt: -1,
    });
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Get one chat
router.get("/:chatId", auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.userId,
    });
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Create chat
router.post("/create", auth, async (req, res) => {
  try {
    const chat = new Chat({
      userId: req.userId,
      title: req.body.title,
      messages: req.body.messages,
    });
    await chat.save();
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Add message
router.post("/:chatId/message", auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.userId,
    });
    chat.messages.push(req.body);
    chat.updatedAt = new Date();
    await chat.save();
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Delete chat
router.delete("/:chatId", auth, async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.chatId, userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ========== ADD THESE SHARE ROUTES ==========

// Generate shareable link
router.post("/:chatId/share", auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.userId,
    });

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    // Generate unique share token
    const shareToken = require("crypto").randomBytes(16).toString("hex");

    chat.shareToken = shareToken;
    chat.isShared = true;
    await chat.save();

    const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/shared/${shareToken}`;

    res.json({ success: true, shareUrl, shareToken });
  } catch (error) {
    console.error("Error sharing chat:", error);
    res.status(500).json({ success: false, error: "Failed to share chat" });
  }
});

// Revoke share link
router.delete("/:chatId/share", auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.userId,
    });

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    chat.shareToken = null;
    chat.isShared = false;
    await chat.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Error unsharing chat:", error);
    res.status(500).json({ success: false, error: "Failed to unshare chat" });
  }
});

// Get shared chat (public - no auth required)
router.get("/shared/:shareToken", async (req, res) => {
  try {
    const chat = await Chat.findOne({
      shareToken: req.params.shareToken,
      isShared: true,
    }).populate("userId", "name");

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Shared chat not found or has been revoked",
      });
    }

    res.json({
      success: true,
      chat: {
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        sharedBy: chat.userId?.name || "Anonymous",
      },
    });
  } catch (error) {
    console.error("Error fetching shared chat:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to load shared chat" });
  }
});

module.exports = router;
