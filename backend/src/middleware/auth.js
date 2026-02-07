import express from "express";
import jwt from "jsonwebtoken";
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
import User from "../models/User.js";

const router = express.Router();

// Public routes
router.post("/signup", registerValidation, validate, register); // Changed from /register to /signup
router.post("/login", loginValidation, validate, login);
router.post("/google", googleAuth);

// Token verification
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
    const user = await User.findById(decoded.id).select("-password");

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

export default router;
