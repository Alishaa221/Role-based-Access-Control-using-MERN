import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Get all users (Admin only)
router.get("/all", authenticateToken, authorize(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Reset all users (Admin only) - must be ABOVE :userId
router.delete("/reset", authenticateToken, authorize(["admin"]), async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: "All users deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get current user profile (Everyone - scoped to self)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Update user role (Admin only)
router.put("/role/:userId", authenticateToken, authorize(["admin"]), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "editor", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get content (Admin sees all editors, Editor sees only self)
router.get("/content", authenticateToken, authorize(["editor", "admin"]), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "admin") {
      query = { role: "editor" };
    } else if (req.user.role === "editor") {
      query = { _id: req.user.id };
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Delete user (Scoped: Admin can delete anyone, others only themselves)
router.delete("/:userId", authenticateToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const deletedUser = await User.findByIdAndDelete(req.params.userId);
      if (!deletedUser) return res.status(404).json({ message: "User not found" });
      return res.json({ message: "User deleted successfully (by admin)" });
    }

    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "Access denied. You can only delete your own account." });
    }

    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Your account has been deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
