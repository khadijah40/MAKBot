import React, { useState, useRef, useEffect } from "react";
import SignUp from "./Signup";
import Login from "./Login";
import ShareModal from "./ShareModal";
import { Link } from "react-router-dom";

const MAKBot = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareConversationId, setShareConversationId] = useState(null);
  const messageInputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  // Chat history state
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    }
  };

  // Check auth on component mount and listen for Google OAuth callback
  useEffect(() => {
    checkAuth();

    try {
      // Handle Google OAuth callback
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const userParam = params.get("user");

      if (token && userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);

          // Clear URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );

          // Close any open modals
          setShowSignUp(false);
          setShowLogin(false);

          window.dispatchEvent(new Event("auth-change"));
        } catch (error) {
          console.error("Error parsing Google auth data:", error);
        }
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
    }

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  // Load chat history when user logs in
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

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
    if (e.target) {
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load chat history from backend
  const loadChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingHistory(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/chat/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.chats)) {
        setChatHistory(data.chats);
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setChatHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load specific chat
  const loadChat = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load chat");
      }

      const data = await response.json();
      if (data.success && data.chat) {
        setMessages(data.chat.messages || []);
        setCurrentChatId(chatId);
        setShowEmptyState(false);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  // Delete chat
  const deleteChat = async (chatId, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      const data = await response.json();
      if (data.success) {
        if (chatId === currentChatId) {
          createNewChat();
        }
        loadChatHistory();
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Format chat time (e.g., "5m ago", "2h ago")
  const formatChatTime = (date) => {
    try {
      const chatDate = new Date(date);
      const now = new Date();
      const diffMs = now - chatDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return chatDate.toLocaleDateString();
    } catch (error) {
      return "Recently";
    }
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;

    if (!user) {
      alert("Please sign up or log in to use the chat");
      setShowSignUp(true);
      return;
    }

    setShowEmptyState(false);

    const userMessage = { text: message, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    setInputValue("");
    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto";
    }

    // Create new chat or add to existing
    let chatId = currentChatId;
    if (!chatId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/chat/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: message.substring(0, 50),
            messages: [userMessage],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.chat) {
            chatId = data.chat._id;
            setCurrentChatId(chatId);
            loadChatHistory();
          }
        }
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    } else {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5000/api/chat/${chatId}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userMessage),
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }

    const typingMessage = {
      text: "Typing...",
      sender: "assistant",
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: messages.slice(-10),
        }),
      });

      const data = await response.json();

      setMessages((prev) => prev.filter((msg) => !msg.isTyping));

      if (data.success) {
        const aiResponse = {
          text: data.response,
          sender: "assistant",
        };
        setMessages((prev) => [...prev, aiResponse]);

        // Save AI response
        if (chatId) {
          try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:5000/api/chat/${chatId}/message`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(aiResponse),
            });
            loadChatHistory();
          } catch (error) {
            console.error("Error saving AI response:", error);
          }
        }
      } else {
        const errorResponse = {
          text: "Sorry, I couldn't process that. Please try again.",
          sender: "assistant",
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => prev.filter((msg) => !msg.isTyping));

      const errorResponse = {
        text: "Sorry, something went wrong. Please try again.",
        sender: "assistant",
      };
      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  const useSuggestion = (prompt) => {
    setInputValue(prompt);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const createNewChat = () => {
    setMessages([]);
    setShowEmptyState(true);
    setCurrentChatId(null);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    setMessages([]);
    setShowEmptyState(true);
    setChatHistory([]);
    setCurrentChatId(null);
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
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
    window.dispatchEvent(new Event("auth-change"));
  };

  const switchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  const handleShareChat = (chatId) => {
    setShareConversationId(chatId);
    setShowShareModal(true);
  };

  return (
    <div style={styles.appContainer}>
      {showSignUp && (
        <SignUp
          onClose={() => setShowSignUp(false)}
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={switchToSignup}
        />
      )}

      {showShareModal && (
        <ShareModal
          conversationId={shareConversationId}
          onClose={() => setShowShareModal(false)}
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
      >
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>MAKBot</div>
        </div>

        <button style={styles.newChatBtn} onClick={createNewChat}>
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
            loadingHistory ? (
              <div style={styles.loginPrompt}>
                <p>Loading chats...</p>
              </div>
            ) : chatHistory && chatHistory.length > 0 ? (
              <div style={styles.chatSection}>
                <div style={styles.chatSectionTitle}>Recent Chats</div>
                {chatHistory.map((chat) => (
                  <div
                    key={chat._id || Math.random()}
                    className="chatItem"
                    style={{
                      ...styles.chatItem,
                      ...(currentChatId === chat._id
                        ? styles.chatItemActive
                        : {}),
                    }}
                    onClick={() => loadChat(chat._id)}
                  >
                    <svg
                      style={styles.chatIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <div style={styles.chatItemContent}>
                      <div style={styles.chatItemTitle}>
                        {chat.title || "Untitled Chat"}
                      </div>
                      <div style={styles.chatItemTime}>
                        {chat.updatedAt
                          ? formatChatTime(chat.updatedAt)
                          : "Recently"}
                      </div>
                    </div>
                    <div style={styles.chatActions} className="chatActions">
                      <button
                        className="shareBtn"
                        style={styles.shareBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareChat(chat._id);
                        }}
                        title="Share chat"
                      >
                        <svg
                          style={styles.actionBtnSvg}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      </button>
                      <button
                        className="deleteBtn"
                        style={styles.deleteBtn}
                        onClick={(e) => deleteChat(chat._id, e)}
                        title="Delete chat"
                      >
                        <svg
                          style={styles.deleteBtnSvg}
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
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.loginPrompt}>
                <p>No conversations yet. Start chatting!</p>
              </div>
            )
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
              {(currentChatId &&
                chatHistory &&
                chatHistory.find((c) => c._id === currentChatId)?.title) ||
                "New Chat"}
            </h1>
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
                      alt={user.name || "User"}
                      style={styles.profileImage}
                    />
                  ) : (
                    <div style={styles.profileInitials}>
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span style={styles.userName} className="user-name-text">
                    {user.name || "User"}
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
                      <div style={styles.dropdownName}>
                        {user.name || "User"}
                      </div>
                      <div style={styles.dropdownEmail}>{user.email || ""}</div>
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
                    <Link
                      to="/settings"
                      style={{ ...styles.dropdownItem, textDecoration: "none" }}
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
                    </Link>
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
              <div style={styles.authButtons} className="auth-buttons">
                <button
                  style={styles.loginBtn}
                  className="login-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Log In
                </button>
                <button
                  style={styles.signUpBtn}
                  className="signup-btn"
                  onClick={() => setShowSignUp(true)}
                >
                  Sign Up
                </button>
              </div>
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

        @media (max-width: 768px) {
          .chat-header {
            padding: 12px 16px !important;
          }

          .chat-title {
            font-size: 18px !important;
          }

          .auth-buttons {
            gap: 8px !important;
          }

          .login-btn,
          .signup-btn {
            padding: 8px 16px !important;
            font-size: 13px !important;
          }

          .user-name-text {
            display: none !important;
          }

          .suggestions {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .chat-messages {
            padding: 16px !important;
            gap: 16px !important;
          }

          .chat-input-container {
            padding: 12px !important;
          }

          .chat-input {
            padding: 12px 48px 12px 16px !important;
            font-size: 14px !important;
          }

          .sidebar-toggle {
            width: 36px !important;
            height: 36px !important;
          }
        }

        @media (max-width: 480px) {
          .login-btn {
            display: none !important;
          }

          .signup-btn {
            padding: 8px 20px !important;
            font-size: 14px !important;
          }

          .chat-title {
            font-size: 16px !important;
          }
        }

        /* Chat item hover effects */
        .chatItem:hover {
          background: rgba(157, 123, 94, 0.05);
        }
        
        .chatItem:hover .chatActions {
          display: flex !important;
        }
        
        .shareBtn:hover {
          background: rgba(157, 123, 94, 0.1);
        }
        
        .deleteBtn:hover {
          background: rgba(204, 51, 51, 0.1);
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
    padding: "8px 0",
  },
  chatSection: {
    marginBottom: "20px",
  },
  chatSectionTitle: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#a39a8f",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "8px 12px",
    marginBottom: "4px",
  },
  chatItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    margin: "2px 8px",
    position: "relative",
    background: "transparent",
  },
  chatItemActive: {
    background: "rgba(157, 123, 94, 0.1)",
    borderLeft: "3px solid #9d7b5e",
  },
  chatIcon: {
    width: "16px",
    height: "16px",
    color: "#6b6359",
    flexShrink: 0,
  },
  chatItemContent: {
    flex: 1,
    minWidth: 0,
  },
  chatItemTitle: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#3d3731",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginBottom: "2px",
  },
  chatItemTime: {
    fontSize: "11px",
    color: "#a39a8f",
  },
  chatActions: {
    display: "none",
    alignItems: "center",
    gap: "4px",
  },
  shareBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    transition: "all 0.2s",
    flexShrink: 0,
  },
  actionBtnSvg: {
    width: "16px",
    height: "16px",
    color: "#6b6359",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    transition: "all 0.2s",
    flexShrink: 0,
  },
  deleteBtnSvg: {
    width: "16px",
    height: "16px",
    color: "#c33",
  },
  loginPrompt: {
    padding: "20px",
    textAlign: "center",
    color: "#a39a8f",
    fontSize: "14px",
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
    flex: 1,
    minWidth: 0,
  },
  authSection: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  authButtons: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  loginBtn: {
    padding: "10px 24px",
    background: "transparent",
    border: "1px solid #ebe8e3",
    borderRadius: "10px",
    color: "#3d3731",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
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
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
};

export default MAKBot;
