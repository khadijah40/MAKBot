import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SharedChat = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedChat();
  }, [shareToken]);

  const loadSharedChat = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chat/shared/${shareToken}`,
      );

      const data = await response.json();

      if (data.success) {
        setChat(data.chat);
      } else {
        setError(data.error || "Failed to load shared chat");
      }
    } catch (err) {
      setError("Failed to load shared chat");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Chat Not Found</h2>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.homeBtn} onClick={() => navigate("/")}>
            Go to MAKBot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>MAKBot</div>
        <button style={styles.tryBtn} onClick={() => navigate("/")}>
          Try MAKBot
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.chatContainer}>
          <div style={styles.chatHeader}>
            <h1 style={styles.chatTitle}>{chat?.title || "Shared Chat"}</h1>
            <p style={styles.chatMeta}>
              Shared by {chat?.sharedBy} •{" "}
              {new Date(chat?.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div style={styles.messages}>
            {chat?.messages?.map((message, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.message,
                  ...(message.sender === "user"
                    ? styles.messageUser
                    : styles.messageAssistant),
                }}
              >
                <div
                  style={{
                    ...styles.messageAvatar,
                    ...(message.sender === "user"
                      ? styles.avatarUser
                      : styles.avatarAssistant),
                  }}
                >
                  {message.sender === "user" ? "U" : "K"}
                </div>
                <div style={styles.messageContent}>
                  <div
                    style={{
                      ...styles.messageText,
                      ...(message.sender === "user"
                        ? styles.textUser
                        : styles.textAssistant),
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          This is a shared conversation.
          <button style={styles.footerLink} onClick={() => navigate("/")}>
            Create your own chat with MAKBot
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f7f5f2",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px 40px",
    background: "#fefdfb",
    borderBottom: "1px solid rgba(61, 55, 49, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: "28px",
    fontWeight: 600,
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  tryBtn: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
  },
  chatContainer: {
    maxWidth: "800px",
    width: "100%",
    background: "#fefdfb",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 16px rgba(61, 55, 49, 0.1)",
  },
  chatHeader: {
    marginBottom: "32px",
    borderBottom: "1px solid rgba(61, 55, 49, 0.1)",
    paddingBottom: "20px",
  },
  chatTitle: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: "32px",
    fontWeight: 600,
    color: "#3d3731",
    marginBottom: "8px",
  },
  chatMeta: {
    fontSize: "14px",
    color: "#6b6359",
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  message: {
    display: "flex",
    gap: "16px",
  },
  messageUser: {
    flexDirection: "row-reverse",
  },
  messageAssistant: {
    flexDirection: "row",
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
    color: "white",
  },
  avatarUser: {
    background: "linear-gradient(135deg, #8b7e74, #6b5d52)",
  },
  avatarAssistant: {
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
  },
  messageContent: {
    flex: 1,
    paddingTop: "8px",
  },
  messageText: {
    padding: "12px 16px",
    borderRadius: "16px",
    lineHeight: 1.7,
    wordWrap: "break-word",
  },
  textUser: {
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    color: "white",
    borderBottomRightRadius: "4px",
  },
  textAssistant: {
    background: "#ebe8e3",
    color: "#3d3731",
    borderBottomLeftRadius: "4px",
  },
  footer: {
    padding: "20px",
    background: "#fefdfb",
    borderTop: "1px solid rgba(61, 55, 49, 0.1)",
    textAlign: "center",
  },
  footerText: {
    fontSize: "14px",
    color: "#6b6359",
  },
  footerLink: {
    marginLeft: "8px",
    color: "#9d7b5e",
    fontWeight: 600,
    cursor: "pointer",
    background: "none",
    border: "none",
    textDecoration: "underline",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: "20px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #ebe8e3",
    borderTop: "4px solid #9d7b5e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  error: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    padding: "20px",
  },
  errorIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  errorTitle: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: "32px",
    fontWeight: 600,
    color: "#3d3731",
    marginBottom: "8px",
  },
  errorText: {
    fontSize: "16px",
    color: "#6b6359",
    marginBottom: "24px",
  },
  homeBtn: {
    padding: "12px 32px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: 600,
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default SharedChat;
