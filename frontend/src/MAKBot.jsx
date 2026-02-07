import React, { useState, useRef, useEffect } from "react";
import SignUp from "./Signup";
import Login from "./Login";
import ShareModal from "./ShareModal";
import { useNavigate } from "react-router-dom";

const MAKBot = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const messageInputRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const suggestions = [
    {
      icon: "🔬",
      title: "Explain a Concept",
      description: "Quantum computing in simple terms",
      prompt: "Explain quantum computing in simple terms",
    },
    {
      icon: "✍️",
      title: "Creative Writing",
      description: "Generate a short story or poem",
      prompt: "Write a creative short story",
    },
    {
      icon: "💻",
      title: "Code Assistance",
      description: "Debug and improve your code",
      prompt: "Help me debug this code",
    },
    {
      icon: "📅",
      title: "Productivity Tips",
      description: "Organize and plan your schedule",
      prompt: "Plan my week effectively",
    },
  ];

  // Check if user is logged in
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      loadConversations();
    } else {
      setUser(null);
    }
  };

  // Load all conversations
  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // Load a specific conversation
  const loadConversation = async (conversationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setMessages(data.conversation.messages);
        setActiveConversationId(conversationId);
        setShowEmptyState(false);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  // Check auth on component mount
  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;

    // Check if user is logged in
    if (!user) {
      alert("Please sign up or log in to use the chat");
      setShowSignUp(true);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      // If no active conversation, create a new one
      if (!activeConversationId) {
        const createResponse = await fetch(`${API_URL}/api/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: message.slice(0, 40) + (message.length > 40 ? "..." : ""),
            personality: "general",
          }),
        });

        const createData = await createResponse.json();
        if (createData.success) {
          setActiveConversationId(createData.conversation._id);
          loadConversations(); // Refresh sidebar
        }
      }

      setShowEmptyState(false);

      // Add user message to UI immediately
      const userMessage = { text: message, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);

      // Clear input
      setInputValue("");
      if (messageInputRef.current) {
        messageInputRef.current.style.height = "auto";
      }

      // Save user message to database
      if (activeConversationId) {
        await fetch(
          `${API_URL}/api/conversations/${activeConversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userMessage),
          },
        );
      }

      // Call Cerebras AI API
      const chatResponse = await fetch(`${API_URL}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          personality: "general",
          conversationHistory: messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      });

      const chatData = await chatResponse.json();

      const aiResponse = {
        text: chatData.success
          ? chatData.message
          : "Sorry, I couldn't process that. Please try again.",
        sender: "assistant",
      };

      // Add AI response to UI
      setMessages((prev) => [...prev, aiResponse]);

      // Save AI response to database
      if (activeConversationId) {
        await fetch(
          `${API_URL}/api/conversations/${activeConversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(aiResponse),
          },
        );

        // Refresh conversations list to update timestamp
        loadConversations();
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Network error. Please check your connection and try again.",
          sender: "assistant",
        },
      ]);
    }
  };

  const useSuggestion = (prompt) => {
    setInputValue(prompt);
    messageInputRef.current?.focus();
  };

  const createNewChat = () => {
    setMessages([]);
    setShowEmptyState(true);
    setActiveConversationId(null);
    setSidebarOpen(false);
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Prevent selecting the conversation

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}`, // Changed from http://localhost:5000
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        // If we're deleting the active conversation, create a new one
        if (conversationId === activeConversationId) {
          createNewChat();
        }
        // Refresh conversations list
        loadConversations();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Logout error:", err);
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    setConversations([]);
    setMessages([]);
    setActiveConversationId(null);
    setShowEmptyState(true);
    window.dispatchEvent(new Event("auth-change"));
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setShowSignUp(false);
    window.dispatchEvent(new Event("auth-change"));
    loadConversations();
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
    window.dispatchEvent(new Event("auth-change"));
    loadConversations();
  };

  const switchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / 60000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Render conversation groups
  const renderConversationGroups = () => {
    const groups = [
      { key: "today", label: "Today" },
      { key: "yesterday", label: "Yesterday" },
      { key: "lastWeek", label: "Last 7 Days" },
      { key: "lastMonth", label: "Last 30 Days" },
      { key: "older", label: "Older" },
    ];

    return groups.map(
      (group) =>
        conversations[group.key]?.length > 0 && (
          <div key={group.key} style={styles.conversationGroup}>
            <div style={styles.conversationGroupTitle}>{group.label}</div>
            {conversations[group.key].map((conv) => (
              <div
                key={conv._id}
                style={{
                  ...styles.conversationItem,
                  ...(activeConversationId === conv._id
                    ? styles.conversationItemActive
                    : {}),
                }}
                className="conversation-item"
                onClick={() => loadConversation(conv._id)}
              >
                <div style={styles.conversationContent}>
                  <div
                    style={styles.conversationTitle}
                    className="conversation-title"
                  >
                    {conv.title}
                  </div>
                  <div style={styles.conversationTime}>
                    {formatTime(conv.updatedAt)}
                  </div>
                </div>
                <button
                  style={styles.deleteButton}
                  onClick={(e) => deleteConversation(conv._id, e)}
                >
                  <svg
                    style={styles.deleteIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ),
    );
  };

  return (
    <div style={styles.appContainer}>
      {showSignUp && (
        <SignUp
          onClose={() => setShowSignUp(false)}
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={switchToLogin} // ← ADD THIS
        />
      )}

      {showLogin && ( // ← ADD ALL OF THIS
        <Login
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={switchToSignup}
        />
      )}

      <div
        style={{
          ...styles.sidebarOverlay,
          ...(sidebarOpen ? styles.sidebarOverlayActive : {}),
        }}
        onClick={toggleSidebar}
      />

      <aside
        style={{
          ...styles.sidebar,
          ...(sidebarOpen ? styles.sidebarOpen : {}),
        }}
        className="sidebar"
      >
        <div style={styles.sidebarHeader}>
          <div style={styles.logo} className="logo">
            MAKBot
          </div>
        </div>

        <button
          style={styles.newChatBtn}
          className="new-chat-btn"
          onClick={createNewChat}
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={styles.newChatBtnSvg}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Conversation
        </button>

        <div style={styles.conversations}>
          {user ? (
            renderConversationGroups()
          ) : (
            <div style={styles.loginPrompt}>
              <p>Sign in to save your conversations</p>
            </div>
          )}
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.chatHeader} className="chat-header">
          <div style={styles.chatHeaderLeft}>
            <button
              style={styles.sidebarToggle}
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={styles.sidebarToggleSvg}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 style={styles.chatTitle} className="chat-title">
              {activeConversationId ? "Chat" : "New Chat"}
            </h1>
            {activeConversationId && (
              <button
                style={styles.shareBtn}
                className="share-btn"
                onClick={() => setShowShareModal(true)}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={styles.shareBtnIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            )}
          </div>

          <div style={styles.authSection}>
            {user ? (
              <div style={styles.profileContainer}>
                <button
                  style={styles.profileButton}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      style={styles.profileImage}
                    />
                  ) : (
                    <div style={styles.profileInitials}>
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span style={styles.userName} className="user-name">
                    {user.name}
                  </span>
                  <svg
                    style={styles.chevronIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div style={styles.dropdown}>
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownName}>{user.name}</div>
                      <div style={styles.dropdownEmail}>{user.email}</div>
                    </div>
                    <div style={styles.dropdownDivider}></div>
                    <a href="#" style={styles.dropdownItem}>
                      <svg
                        style={styles.dropdownIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </a>
                    <a
                      href="#"
                      style={styles.dropdownItem}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "/settings"; // Simple navigation
                        setShowDropdown(false); // Fixed: was setIsDropdownOpen
                      }}
                    >
                      <svg
                        style={styles.dropdownIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </a>
                    <div style={styles.dropdownDivider}></div>
                    <button style={styles.logoutButton} onClick={handleLogout}>
                      <svg
                        style={styles.dropdownIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                style={styles.signUpBtn}
                onClick={() => setShowSignUp(true)}
              >
                Sign Up
              </button>
            )}
          </div>
        </header>

        <div
          style={styles.chatMessages}
          className="chat-messages"
          ref={chatMessagesRef}
        >
          {showEmptyState ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={styles.emptyStateIconSvg}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 style={styles.emptyStateH2}>Welcome to MAKBot</h2>
              <p style={styles.emptyStateP}>
                Your intelligent assistant powered by advanced AI. Ask anything,
                explore ideas, and get instant answers.
              </p>

              <div style={styles.suggestions} className="suggestions">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    style={styles.suggestionCard}
                    onClick={() => useSuggestion(suggestion.prompt)}
                  >
                    <h4 style={styles.suggestionCardH4}>
                      {suggestion.icon} {suggestion.title}
                    </h4>
                    <p style={styles.suggestionCardP}>
                      {suggestion.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.message,
                  ...(message.sender === "user"
                    ? styles.messageUser
                    : styles.messageAssistant),
                  animationDelay: `${idx * 0.1}s`,
                }}
                className={message.sender}
              >
                <div
                  style={{
                    ...styles.messageAvatar,
                    ...(message.sender === "user"
                      ? styles.messageAvatarUser
                      : styles.messageAvatarAssistant),
                  }}
                >
                  {message.sender === "user" ? "U" : "K"}
                </div>
                <div
                  style={{
                    ...styles.messageContent,
                    ...(message.sender === "user"
                      ? styles.messageContentUser
                      : styles.messageContentAssistant),
                  }}
                >
                  <div
                    style={{
                      ...styles.messageText,
                      ...(message.sender === "user"
                        ? styles.messageTextUser
                        : styles.messageTextAssistant),
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.chatInputContainer} className="chat-input-container">
          <div style={styles.chatInputWrapper}>
            <textarea
              ref={messageInputRef}
              style={styles.chatInput}
              className="chat-input"
              placeholder="Type your message here..."
              rows="1"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />
            <button style={styles.sendButton} onClick={sendMessage}>
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={styles.sendButtonSvg}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {showDropdown && (
        <div
          style={styles.dropdownOverlay}
          onClick={() => setShowDropdown(false)}
        />
      )}
      {showShareModal && (
        <ShareModal
          conversationId={activeConversationId}
          onClose={() => setShowShareModal(false)}
        />
      )}
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;600&family=DM+Sans:wght@400;500;700&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'DM Sans', -apple-system, sans-serif;
    overflow: hidden;
    height: 100vh;
  }
  
  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

 /* ============ MOBILE RESPONSIVE ============ */
@media (max-width: 768px) {
  /* Wider sidebar when open */
  .sidebar {
    width: 260px !important;
  }
  
  /* Smaller logo */
  .logo {
    font-size: 20px !important;
  }
  
  /* Smaller new chat button */
  .new-chat-btn {
    margin: 12px !important;
    padding: 10px 14px !important;
    font-size: 13px !important;
  }
  
  /* Smaller conversation items */
  .conversation-item {
    padding: 8px 12px !important;
  }
  
  .conversation-title {
    font-size: 12px !important;
  }
  
  /* Compact header */
  .chat-header {
    padding: 12px 16px !important;
  }
  
  .chat-title {
    font-size: 18px !important;
  }
  
  /* Hide user name in profile, keep only avatar */
  .user-name {
    display: none !important;
  }
  
  /* Smaller share button */
  .share-btn {
    width: 30px !important;
    height: 30px !important;
  }
  
  /* Single column suggestions */
  .suggestions {
    grid-template-columns: 1fr !important;
  }
  
  /* Compact messages */
  .chat-messages {
    padding: 16px !important;
    gap: 16px !important;
  }
  
  /* Smaller input */
  .chat-input-container {
    padding: 12px !important;
  }
  
  .chat-input {
    padding: 12px 48px 12px 16px !important;
    font-size: 14px !important;
  }
}

/* For very small phones */
@media (max-width: 480px) {
  .sidebar {
    width: 220px !important;
  }
  
  .new-chat-btn {
    font-size: 12px !important;
    padding: 8px 12px !important;
  }
  
  .logo {
    font-size: 18px !important;
  }
}
`}</style>
    </div>
  );
};

const styles = {
  appContainer: {
    display: "flex",
    height: "100vh",
    position: "relative",
    background: "#f7f5f2",
    color: "#3d3731",
  },
  sidebar: {
    width: "280px",
    background: "#fefdfb",
    borderRight: "1px solid rgba(61, 55, 49, 0.1)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 100,
    position: "absolute",
    height: "100%",
    transform: "translateX(-100%)",
    boxShadow: "0 2px 16px rgba(61, 55, 49, 0.08)",
  },
  sidebarOpen: {
    transform: "translateX(0)",
  },
  sidebarHeader: {
    padding: "24px 20px",
    borderBottom: "1px solid rgba(61, 55, 49, 0.1)",
  },
  logo: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: "28px",
    fontWeight: 600,
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  newChatBtn: {
    margin: "20px",
    padding: "14px 20px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(157, 123, 94, 0.15)",
  },
  newChatBtnSvg: {
    width: "20px",
    height: "20px",
  },
  conversations: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 12px",
  },
  loginPrompt: {
    padding: "20px",
    textAlign: "center",
    color: "#a39a8f",
    fontSize: "14px",
  },
  conversationGroup: {
    marginBottom: "24px",
  },
  conversationGroupTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#a39a8f",
    textTransform: "uppercase",
    letterSpacing: "1px",
    padding: "8px 12px",
    marginBottom: "4px",
  },
  conversationItem: {
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "4px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  conversationItemActive: {
    background: "#ebe8e3",
  },
  conversationContent: {
    flex: 1,
    minWidth: 0,
  },
  conversationTitle: {
    fontSize: "14px",
    color: "#3d3731",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  conversationTime: {
    fontSize: "12px",
    color: "#a39a8f",
    marginTop: "4px",
  },
  deleteButton: {
    padding: "6px",
    background: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
    transition: "all 0.2s",
  },
  deleteIcon: {
    width: "16px",
    height: "16px",
    color: "#c33",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#f7f5f2",
    position: "relative",
  },
  chatHeader: {
    padding: "20px 32px",
    borderBottom: "1px solid rgba(61, 55, 49, 0.1)",
    background: "#fefdfb",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    justifyContent: "space-between",
  },
  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  authSection: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  signUpBtn: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(157, 123, 94, 0.15)",
    whiteSpace: "nowrap",
  },
  profileContainer: {
    position: "relative",
  },
  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "transparent",
    border: "1px solid #ebe8e3",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  profileImage: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  profileInitials: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 600,
  },
  userName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#3d3731",
  },
  chevronIcon: {
    width: "16px",
    height: "16px",
    color: "#6b6359",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(61, 55, 49, 0.15)",
    minWidth: "220px",
    border: "1px solid #ebe8e3",
    overflow: "hidden",
    zIndex: 1000,
  },
  dropdownHeader: {
    padding: "16px",
    background: "#faf9f7",
  },
  dropdownName: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#3d3731",
    marginBottom: "4px",
  },
  dropdownEmail: {
    fontSize: "13px",
    color: "#6b6359",
  },
  dropdownDivider: {
    height: "1px",
    background: "#ebe8e3",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    color: "#3d3731",
    fontSize: "14px",
    textDecoration: "none",
    transition: "background 0.2s",
    cursor: "pointer",
  },
  dropdownIcon: {
    width: "18px",
    height: "18px",
    color: "#6b6359",
  },
  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    color: "#c33",
    fontSize: "14px",
    textAlign: "left",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  sidebarToggle: {
    width: "40px",
    height: "40px",
    background: "#ebe8e3",
    border: "1px solid rgba(61, 55, 49, 0.1)",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    flexShrink: 0,
  },
  sidebarToggleSvg: {
    width: "20px",
    height: "20px",
    color: "#3d3731",
  },
  sidebarOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(61, 55, 49, 0.35)",
    backdropFilter: "blur(4px)",
    opacity: 0,
    visibility: "hidden",
    transition: "all 0.3s ease",
    zIndex: 99,
  },
  sidebarOverlayActive: {
    opacity: 1,
    visibility: "visible",
  },
  chatTitle: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: "24px",
    fontWeight: 600,
    letterSpacing: "-0.5px",
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateIcon: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    boxShadow:
      "0 8px 32px rgba(157, 123, 94, 0.15), 0 2px 8px rgba(157, 123, 94, 0.2)",
  },
  emptyStateIconSvg: {
    width: "40px",
    height: "40px",
    color: "white",
  },
  emptyStateH2: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: "32px",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  emptyStateP: {
    color: "#6b6359",
    fontSize: "16px",
    maxWidth: "400px",
    textAlign: "center",
    lineHeight: 1.6,
  },
  suggestions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginTop: "48px",
    maxWidth: "800px",
  },
  suggestionCard: {
    padding: "20px",
    background: "#fefdfb",
    border: "1px solid rgba(61, 55, 49, 0.1)",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  suggestionCardH4: {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "8px",
    color: "#3d3731",
  },
  suggestionCardP: {
    fontSize: "13px",
    color: "#6b6359",
    lineHeight: 1.5,
  },
  message: {
    display: "flex",
    gap: "16px",
    animation: "messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
  },
  messageUser: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  messageAssistant: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontWeight: 600,
    fontSize: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    color: "white",
  },
  messageAvatarUser: {
    background: "linear-gradient(135deg, #8b7e74, #6b5d52)",
  },
  messageAvatarAssistant: {
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
  },
  messageContent: {
    flex: 1,
    paddingTop: "8px",
  },
  messageContentUser: {
    display: "flex",
    justifyContent: "flex-end",
  },
  messageContentAssistant: {
    display: "flex",
    justifyContent: "flex-start",
  },
  messageText: {
    lineHeight: 1.7,
    color: "#3d3731",
    padding: "12px 16px",
    borderRadius: "16px",
    maxWidth: "600px",
    wordWrap: "break-word",
  },
  messageTextUser: {
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    color: "white",
    borderBottomRightRadius: "4px",
  },
  messageTextAssistant: {
    background: "#fefdfb",
    border: "1px solid rgba(61, 55, 49, 0.1)",
    borderBottomLeftRadius: "4px",
  },
  chatInputContainer: {
    padding: "24px 32px",
    borderTop: "1px solid rgba(61, 55, 49, 0.1)",
    background: "#fefdfb",
  },
  chatInputWrapper: {
    maxWidth: "1000px",
    margin: "0 auto",
    position: "relative",
  },
  chatInput: {
    width: "100%",
    padding: "16px 56px 16px 20px",
    background: "#ebe8e3",
    border: "1px solid rgba(61, 55, 49, 0.1)",
    borderRadius: "16px",
    color: "#3d3731",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    transition: "all 0.3s ease",
    minHeight: "56px",
    maxHeight: "200px",
  },
  sendButton: {
    position: "absolute",
    right: "12px",
    bottom: "12px",
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  sendButtonSvg: {
    width: "20px",
    height: "20px",
    color: "white",
  },

  shareBtn: {
    width: "36px",
    height: "36px",
    background: "white",
    border: "1px solid #ebe8e3",
    borderRadius: "8px",
    color: "#3d3731",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    marginLeft: "auto",
  },
  shareBtnIcon: {
    width: "18px",
    height: "18px",
  },
};

export default MAKBot;
