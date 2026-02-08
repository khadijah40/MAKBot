const express = require("express");
const router = express.Router();
const Cerebras = require("@cerebras/cerebras_cloud_sdk");
const jwt = require("jsonwebtoken");

// Initialize Cerebras client
const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this",
    );
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Chat endpoint
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Build messages array for Cerebras
    const messages = [
      {
        role: "system",
        content:
          "You are MAKBot, a helpful and friendly AI assistant. Be conversational, helpful, and concise. Keep responses clear and engaging.",
      },
    ];

    // Add conversation history if provided (last 10 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-10).forEach((msg) => {
        if (!msg.isTyping) {
          // Skip typing indicators
          messages.push({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: "user",
      content: message,
    });

    // Call Cerebras API
    const completion = await client.chat.completions.create({
      model: "llama3.1-8b", // Fast and good quality
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
      stream: false,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error("Cerebras API error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate AI response",
      details: error.message,
    });
  }
});

module.exports = router;
