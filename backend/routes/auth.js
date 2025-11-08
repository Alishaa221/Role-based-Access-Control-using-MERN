import express from "express"
import bcrypt from "bcryptjs"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import User from "../models/User.js"
import { generateToken } from "../middleware/auth.js"
import { logEvent } from "../utils/logger.js"

const router = express.Router()

// ✅ Rate limiter (prevent spam signups)
const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many registration attempts. Please try again later.",
})

/* ==========================================================
   🔑 LOGIN ROUTE
========================================================== */
/* ==========================================================
   🔑 FIXED LOGIN ROUTE — supports old plain passwords
========================================================== */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const email = req.body.email.trim().toLowerCase()
    const { password } = req.body

    try {
      const user = await User.findOne({ email })
      if (!user) {
        logEvent("warn", "Login failed - User not found", { email })
        return res.status(401).json({ message: "Invalid email or password" })
      }

      let isPasswordValid = false

      // Try bcrypt comparison first
      try {
        isPasswordValid = await bcrypt.compare(password, user.password)
      } catch {
        isPasswordValid = false
      }

      // If bcrypt fails (means old plain password), check directly
      if (!isPasswordValid && password === user.password) {
        // Auto-upgrade: hash and save the password now
        const hashed = await bcrypt.hash(password, 10)
        user.password = hashed
        await user.save()
        isPasswordValid = true
        logEvent("info", "Password auto-hashed for legacy user", { email })
      }

      if (!isPasswordValid) {
        logEvent("warn", "Login failed - Incorrect password", { email })
        return res.status(401).json({ message: "Invalid email or password" })
      }

      const token = generateToken(user)

      logEvent("info", "User logged in successfully", {
        userId: user._id,
        email: user.email,
        role: user.role,
      })

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      logEvent("error", "Login error", { error: error.message })
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }
)

/* ==========================================================
   📝 REGISTER ROUTE
========================================================== */
router.post(
  "/register",
  registerLimiter,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .withMessage("Only Gmail addresses are allowed"),
    body("password")
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,13}$/)
      .withMessage(
        "Password must be 6–13 characters, include one uppercase letter, one number, and one special character"
      ),
    body("role")
      .isIn(["user", "editor", "admin"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // ✅ Normalize email before saving
    const { name, password, role } = req.body
    const email = req.body.email.trim().toLowerCase()

    try {
      const existing = await User.findOne({ email })
      if (existing) {
        logEvent("warn", "Registration attempt with existing email", { email })
        return res.status(400).json({ message: "Email already registered" })
      }


      const newUser = new User({
        name,
        email,
        password,
        role,
      })

      await newUser.save()

      // ✅ Generate JWT with full payload
      const token = generateToken(newUser)

      logEvent("info", "New user registered successfully", {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role,
      })

      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      })
    } catch (error) {
      logEvent("error", "Registration error", { error: error.message })
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }
)

export default router
