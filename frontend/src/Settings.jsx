import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      alert("Please log in first");
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      navigate("/");
    }
  };

  const handleClearHistory = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all chat history? This cannot be undone.",
      )
    ) {
      return;
    }

    // Clear from localStorage
    localStorage.removeItem("chatHistory");
    alert("Chat history cleared successfully!");
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        localStorage.clear();
        alert("Account deleted successfully");
        navigate("/signup");
      } else {
        alert("Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      alert("Error deleting account");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }

    if (passwords.new.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Password changed successfully!");
        setShowPasswordChange(false);
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        alert(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert("Error changing password");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.title}>Settings</h1>
      </div>

      <div style={styles.content}>
        {/* Account Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Account</h2>

          <div style={styles.card}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Email</span>
              <span style={styles.value}>{user.email}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Member Since</span>
              <span style={styles.value}>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>

            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              style={styles.button}
            >
              Change Password
            </button>

            {showPasswordChange && (
              <form onSubmit={handlePasswordChange} style={styles.passwordForm}>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  style={styles.input}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  style={styles.input}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  style={styles.input}
                  required
                />
                <div style={styles.buttonGroup}>
                  <button type="submit" style={styles.button}>
                    Save Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </section>

        {/* Privacy & Data Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Privacy & Data</h2>

          <div style={styles.card}>
            <div style={styles.option}>
              <div>
                <h3 style={styles.optionTitle}>Chat History</h3>
                <p style={styles.optionDesc}>
                  Your conversations are stored locally in your browser
                </p>
              </div>
            </div>

            <button onClick={handleClearHistory} style={styles.dangerBtn}>
              Clear All Chat History
            </button>

            <div style={styles.divider}></div>

            <div style={styles.option}>
              <div>
                <h3 style={styles.optionTitle}>Delete Account</h3>
                <p style={styles.optionDesc}>
                  Permanently delete your account and all data
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={styles.dangerBtn}
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>⚠️ Delete Account?</h2>
            <p style={styles.modalText}>
              This will permanently delete your account and all data. This
              action cannot be undone.
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.modalCancel}
              >
                Cancel
              </button>
              <button onClick={handleDeleteAccount} style={styles.modalDelete}>
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f6f3",
    padding: "20px",
  },
  header: {
    maxWidth: "800px",
    margin: "0 auto 30px",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: "16px",
    color: "#3d3731",
    cursor: "pointer",
    marginBottom: "10px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#3d3731",
    margin: 0,
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#3d3731",
    marginBottom: "16px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f0ede8",
  },
  label: {
    color: "#8a8278",
    fontSize: "14px",
  },
  value: {
    color: "#3d3731",
    fontWeight: "500",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "16px",
    background: "#3d3731",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  logoutBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "16px",
    background: "#6b6358",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  dangerBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "16px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  option: {
    marginBottom: "16px",
  },
  optionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#3d3731",
    margin: "0 0 4px 0",
  },
  optionDesc: {
    fontSize: "14px",
    color: "#8a8278",
    margin: 0,
  },
  divider: {
    height: "1px",
    background: "#f0ede8",
    margin: "24px 0",
  },
  passwordForm: {
    marginTop: "16px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    border: "1px solid #e0ddd8",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#f0ede8",
    color: "#3d3731",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "400px",
    width: "90%",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#3d3731",
    marginBottom: "12px",
  },
  modalText: {
    fontSize: "14px",
    color: "#8a8278",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
  },
  modalCancel: {
    flex: 1,
    padding: "12px",
    background: "#f0ede8",
    color: "#3d3731",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  modalDelete: {
    flex: 1,
    padding: "12px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontSize: "18px",
    color: "#8a8278",
  },
};

export default Settings;
