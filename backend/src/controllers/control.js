import Conversation from "../models/Conversation.js";
import crypto from "crypto";

// @desc    Get all conversations for a user
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .select("title lastMessageAt createdAt updatedAt isShared shareId")
      .sort({ updatedAt: -1 })
      .limit(50);

    // Group conversations by time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const grouped = {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    };

    conversations.forEach((conv) => {
      const convDate = new Date(conv.updatedAt);
      if (convDate >= today) {
        grouped.today.push(conv);
      } else if (convDate >= yesterday) {
        grouped.yesterday.push(conv);
      } else if (convDate >= lastWeek) {
        grouped.lastWeek.push(conv);
      } else if (convDate >= lastMonth) {
        grouped.lastMonth.push(conv);
      } else {
        grouped.older.push(conv);
      }
    });

    res.status(200).json({
      success: true,
      conversations: grouped,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single conversation with messages
// @route   GET /api/conversations/:id
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req, res, next) => {
  try {
    const { title, personality } = req.body;

    const conversation = await Conversation.create({
      userId: req.user.id,
      title: title || "New Conversation",
      personality: personality || "general",
      messages: [],
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add message to conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
export const addMessage = async (req, res, next) => {
  try {
    const { text, sender } = req.body;

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    conversation.messages.push({
      text,
      sender,
      timestamp: new Date(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update conversation title
// @route   PUT /api/conversations/:id
// @access  Private
export const updateConversation = async (req, res, next) => {
  try {
    const { title } = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      { title },
      { new: true, runValidators: true },
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete conversation
// @route   DELETE /api/conversations/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation deleted",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate conversation title from first message
// @route   POST /api/conversations/:id/generate-title
// @access  Private
export const generateTitle = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    // Get first user message
    const firstMessage = conversation.messages.find(
      (msg) => msg.sender === "user",
    );

    if (firstMessage) {
      // Generate title from first message (take first 40 chars)
      const title =
        firstMessage.text.slice(0, 40) +
        (firstMessage.text.length > 40 ? "..." : "");
      conversation.title = title;
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SHARE FUNCTIONALITY (NEW) ====================

// @desc    Share a conversation (create public link)
// @route   POST /api/conversations/:id/share
// @access  Private
export const shareConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    // Generate unique share link if not already shared
    if (!conversation.shareId) {
      const shareId = crypto.randomBytes(16).toString("hex");
      conversation.shareId = shareId;
      conversation.isShared = true;
      conversation.sharedAt = new Date();
      await conversation.save();
    }

    const shareUrl = `${process.env.CLIENT_URL}/share/${conversation.shareId}`;

    res.status(200).json({
      success: true,
      shareUrl,
      shareId: conversation.shareId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unshare a conversation (revoke public link)
// @route   DELETE /api/conversations/:id/share
// @access  Private
export const unshareConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    conversation.shareId = null;
    conversation.isShared = false;
    conversation.sharedAt = null;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Conversation unshared successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shared conversation (public - no auth required)
// @route   GET /api/share/:shareId
// @access  Public
export const getSharedConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      shareId: req.params.shareId,
      isShared: true,
    }).populate("userId", "name");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Shared conversation not found or has been unshared",
      });
    }

    res.status(200).json({
      success: true,
      conversation: {
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        sharedBy: conversation.userId.name,
      },
    });
  } catch (error) {
    next(error);
  }
};
