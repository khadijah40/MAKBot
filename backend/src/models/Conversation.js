import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "New Conversation",
    },
    messages: [messageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    personality: {
      type: String,
      default: "general",
    },
    // ==================== SHARE FUNCTIONALITY (NEW) ====================
    shareId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values to not be unique
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ shareId: 1 }); // Index for share lookups

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;