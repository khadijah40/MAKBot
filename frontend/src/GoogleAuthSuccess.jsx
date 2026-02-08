import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Dispatch auth change event
        window.dispatchEvent(new Event("auth-change"));

        // Redirect to home
        navigate("/");
      } catch (error) {
        console.error("Error parsing Google auth response:", error);
        navigate("/?error=auth_failed");
      }
    } else {
      navigate("/?error=missing_credentials");
    }
  }, [location, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Completing sign in...</p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f7f5f2",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #ebe8e3",
    borderTop: "4px solid #9d7b5e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    marginTop: "20px",
    fontSize: "16px",
    color: "#6b6359",
  },
};

export default GoogleAuthSuccess;
