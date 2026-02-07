import express from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
  changePassword,
  logout,
  deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  validate,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/google", googleAuth); // Google OAuth route

// Protected routes (require authentication)
router.get("/me", protect, getMe);
router.put(
  "/profile",
  protect,
  updateProfileValidation,
  validate,
  updateProfile,
);
router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  validate,
  changePassword,
);
router.get("/logout", protect, logout);
router.delete("/account", protect, deleteAccount);
// Add these routes to your existing auth.js file

// CHANGE PASSWORD ROUTE
router.post("/change-password", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// DELETE ACCOUNT ROUTE
router.delete("/delete-account", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndDelete(decoded.userId);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
// VERIFY TOKEN ROUTE: GET /api/auth/verify
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

export default router;
