const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  messages: [
    {
      text: String,
      sender: {
        type: String,
        enum: ["user", "assistant"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Share functionality fields
  isShared: {
    type: Boolean,
    default: false,
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", ChatSchema);
