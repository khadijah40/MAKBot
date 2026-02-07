import Cerebras from "@cerebras/cerebras_cloud_sdk";

// Initialize Cerebras client ONLY when needed (after dotenv is loaded)
const getCerebrasClient = () => {
  const key = process.env.CEREBRAS_API_KEY;

  if (!key) {
    throw new Error("CEREBRAS_API_KEY is still missing in environment!");
  }

  return new Cerebras({ apiKey: key });
};

// AI Personalities/System Prompts
const AI_PERSONALITIES = {
  general: {
    name: "General Assistant",
    icon: "🤖",
    systemPrompt: `You are MAKBot, a helpful and friendly AI assistant.
You provide clear, concise, and accurate answers to any question.
You are professional but warm in your responses.
You can help with a wide range of topics including general knowledge, advice, explanations, and casual conversation.
If you don't know something, you admit it honestly.
You're supportive and encouraging.`,
    model: "llama3.1-8b",
  },

  coding: {
    name: "Coding Assistant",
    icon: "💻",
    systemPrompt: `You are a senior software engineer and coding mentor.
You provide clean, well-documented code with detailed explanations.
You follow industry best practices and suggest optimizations.
You explain complex programming concepts in simple, understandable terms.
You help debug code, review implementations, and teach programming concepts.
You support multiple languages: JavaScript, Python, Java, C++, and more.
Always format code properly with markdown code blocks.`,
    model: "llama3.1-70b",
  },

  support: {
    name: "Customer Support",
    icon: "💬",
    systemPrompt: `You are a professional customer support agent.
You are polite, patient, empathetic, and solution-oriented.
You help users solve problems step-by-step with clear instructions.
You listen carefully to their issues and ask clarifying questions when needed.
You maintain a positive attitude even with frustrated customers.
If you can't solve an issue, you acknowledge it and suggest escalation.
You always end with asking if there's anything else you can help with.`,
    model: "llama3.1-8b",
  },

  creative: {
    name: "Creative Writer",
    icon: "✍️",
    systemPrompt: `You are a creative writing assistant and storyteller.
You help users brainstorm ideas, write stories, create characters, and develop plots.
You're imaginative, descriptive, and engaging in your writing style.
You can write in various genres: fiction, fantasy, sci-fi, romance, mystery, etc.
You provide constructive feedback on writing and suggest improvements.
You help with poetry, scripts, dialogue, and creative content.
You inspire creativity and help overcome writer's block.`,
    model: "llama-3.3-70b",
  },

  tutor: {
    name: "Educational Tutor",
    icon: "📚",
    systemPrompt: `You are an experienced educational tutor and teacher.
You help students understand complex topics by breaking them down into simple concepts.
You use examples, analogies, and step-by-step explanations.
You're patient and encouraging, adapting your teaching style to the student's level.
You cover subjects like math, science, history, literature, and more.
You ask questions to check understanding and provide practice problems.
You make learning engaging and fun.`,
    model: "llama3.1-70b",
  },
};

// @desc    Send message to AI
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    if (!process.env.CEREBRAS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server is not configured with CEREBRAS_API_KEY",
      });
    }

    const {
      message,
      personality = "general",
      conversationHistory = [],
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide a message",
      });
    }

    const client = getCerebrasClient();

    const selectedPersonality =
      AI_PERSONALITIES[personality] || AI_PERSONALITIES.general;

    const messages = [
      {
        role: "system",
        content: selectedPersonality.systemPrompt,
      },
      ...conversationHistory.slice(-10),
      {
        role: "user",
        content: message,
      },
    ];

    const completion = await client.chat.completions.create({
      model: selectedPersonality.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
      stream: false,
    });

    const aiResponse = completion.choices[0].message.content;

    res.status(200).json({
      success: true,
      message: aiResponse,
      personality: {
        type: personality,
        name: selectedPersonality.name,
        icon: selectedPersonality.icon,
      },
    });
  } catch (error) {
    console.error("Cerebras API Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate response. Please try again.",
    });
  }
};

// @desc    Stream message to AI (real-time response)
// @route   POST /api/chat/stream
// @access  Private
export const streamMessage = async (req, res, next) => {
  try {
    if (!process.env.CEREBRAS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server is not configured with CEREBRAS_API_KEY",
      });
    }

    const {
      message,
      personality = "general",
      conversationHistory = [],
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide a message",
      });
    }

    const client = getCerebrasClient();

    const selectedPersonality =
      AI_PERSONALITIES[personality] || AI_PERSONALITIES.general;

    const messages = [
      {
        role: "system",
        content: selectedPersonality.systemPrompt,
      },
      ...conversationHistory.slice(-10),
      {
        role: "user",
        content: message,
      },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.chat.completions.create({
      model: selectedPersonality.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Cerebras Streaming Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to stream response. Please try again.",
    });
  }
};

// @desc    Get available AI personalities
// @route   GET /api/chat/personalities
// @access  Public
export const getPersonalities = async (req, res, next) => {
  try {
    const personalities = Object.entries(AI_PERSONALITIES).map(
      ([key, value]) => ({
        id: key,
        name: value.name,
        icon: value.icon,
        model: value.model,
      }),
    );

    res.status(200).json({
      success: true,
      personalities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save conversation to user history
// @route   POST /api/chat/save
// @access  Private
export const saveConversation = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      message: "Conversation saved successfully",
      conversationId: Date.now(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's conversation history
// @route   GET /api/chat/history
// @access  Private
export const getConversationHistory = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      conversations: [],
    });
  } catch (error) {
    next(error);
  }
};
