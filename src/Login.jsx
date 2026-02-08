import React, { useState } from "react";

const Login = ({ onClose, onLoginSuccess, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("User logged in successfully:", data.user);

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }

        window.dispatchEvent(new Event("auth-change"));
        onClose();
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    console.log("Signup clicked");
    if (onSwitchToSignup) {
      onSwitchToSignup();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={styles.closeBtnSvg}
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
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to continue to MAKBot</p>

          {error && (
            <div style={styles.errorBox}>
              <svg
                style={styles.errorIcon}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                style={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p style={styles.signupText}>
            Don't have an account?{" "}
            <span style={styles.signupLink} onClick={handleSignupClick}>
              Sign up
            </span>
          </p>

          <p style={styles.termsText}>
            By logging in, you agree to our{" "}
            <span style={styles.termsLink}>Terms of Service</span> and{" "}
            <span style={styles.termsLink}>Privacy Policy</span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;600&family=DM+Sans:wght@400;500;700&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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
    zIndex: 1000,
    animation: "fadeIn 0.3s ease",
  },
  modal: {
    background: "#fefdfb",
    borderRadius: "24px",
    maxWidth: "480px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(61, 55, 49, 0.3)",
    position: "relative",
    animation: "slideUp 0.3s ease",
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
    transition: "all 0.2s ease",
    zIndex: 10,
  },
  closeBtnSvg: {
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
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: "28px",
    fontWeight: 600,
    color: "#3d3731",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#6b6359",
    marginBottom: "32px",
    textAlign: "center",
  },
  errorBox: {
    width: "100%",
    padding: "12px 16px",
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "12px",
    color: "#c33",
    fontSize: "14px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorIcon: {
    width: "20px",
    height: "20px",
    flexShrink: 0,
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#3d3731",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    background: "#ebe8e3",
    border: "1px solid rgba(61, 55, 49, 0.1)",
    borderRadius: "12px",
    fontSize: "15px",
    color: "#3d3731",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.3s ease",
  },
  submitBtn: {
    width: "100%",
    padding: "14px 20px",
    background: "linear-gradient(135deg, #9d7b5e, #7d6b5a)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(157, 123, 94, 0.2)",
    marginTop: "8px",
  },
  signupText: {
    fontSize: "14px",
    color: "#6b6359",
    marginTop: "24px",
    textAlign: "center",
  },
  signupLink: {
    color: "#9d7b5e",
    fontWeight: 600,
    cursor: "pointer",
  },
  termsText: {
    fontSize: "12px",
    color: "#a39a8f",
    marginTop: "16px",
    textAlign: "center",
    lineHeight: 1.6,
  },
  termsLink: {
    color: "#9d7b5e",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default Login;
