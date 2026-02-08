import React, { useState } from "react";

const ShareModal = ({ conversationId, onClose }) => {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleShare = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/chat/${conversationId}/share`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setShareUrl(data.shareUrl);
      } else {
        setError("Failed to create share link");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnshare = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/chat/${conversationId}/share`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShareUrl("");
    } catch (err) {
      setError("Failed to unshare");
    }
  };

  React.useEffect(() => {
    handleShare();
  }, []);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={styles.closeSvg}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div style={styles.content}>
          <div style={styles.icon}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={styles.iconSvg}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </div>

          <h2 style={styles.title}>Share Chat</h2>
          <p style={styles.subtitle}>
            Anyone with this link can view this conversation
          </p>

          {error && <div style={styles.error}>{error}</div>}

          {loading ? (
            <div style={styles.loading}>Generating share link...</div>
          ) : shareUrl ? (
            <>
              <div style={styles.linkContainer}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  style={styles.linkInput}
                />
                <button style={styles.copyBtn} onClick={copyToClipboard}>
                  {copied ? (
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={styles.btnIcon}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={styles.btnIcon}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <button style={styles.unshareBtn} onClick={handleUnshare}>
                Revoke Link
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(61, 55, 49, 0.5)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modal: {
    background: "#fefdfb",
    borderRadius: "24px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 20px 60px rgba(61, 55, 49, 0.3)",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    width: "36px",
    height: "36px",
    background: "#ebe8e3",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeSvg: {
    width: "20px",
    height: "20px",
    color: "#3d3731",
  },
  content: {
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  icon: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
  },
  iconSvg: {
    width: "32px",
    height: "32px",
    color: "white",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    marginBottom: "8px",
    color: "#3d3731",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b6359",
    marginBottom: "32px",
    textAlign: "center",
  },
  error: {
    width: "100%",
    padding: "12px",
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    color: "#c33",
    fontSize: "14px",
    marginBottom: "16px",
  },
  loading: {
    padding: "20px",
    color: "#6b6359",
  },
  linkContainer: {
    width: "100%",
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  linkInput: {
    flex: 1,
    padding: "12px 16px",
    background: "#ebe8e3",
    border: "1px solid rgba(61, 55, 49, 0.1)",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#3d3731",
    fontFamily: "monospace",
  },
  copyBtn: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  },
  btnIcon: {
    width: "18px",
    height: "18px",
  },
  unshareBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "1px solid #ebe8e3",
    borderRadius: "10px",
    color: "#c33",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default ShareModal;
