import jwt from "jsonwebtoken"
import { logEvent } from "../utils/logger.js"  // ✅ structured logging

/**
 * ✅ Verify JWT and attach user info to request
 * Checks for "Authorization: Bearer <token>" header,
 * verifies token, and sets req.user with decoded info.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Extract <token>

  if (!token) {
    logEvent("warn", "401 Unauthorized - No token provided", {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    })
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      logEvent("warn", "403 Forbidden - Invalid or expired token", {
        ip: req.ip,
        url: req.originalUrl,
        error: err.message,
      })
      return res.status(403).json({ message: "Invalid or expired token" })
    }

    // ✅ Attach decoded user info (id, role, name, email)
    req.user = decodedUser
    next()
  })
}

/**
 * ✅ Role-based access control
 * Example: app.get("/admin", authenticateToken, authorize(["admin"]), handler)
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logEvent("warn", "401 Unauthorized - User not authenticated", {
        ip: req.ip,
        url: req.originalUrl,
      })
      return res.status(401).json({ message: "User not authenticated" })
    }

    if (!allowedRoles.includes(req.user.role)) {
      logEvent("warn", "403 Forbidden - Insufficient permissions", {
        ip: req.ip,
        url: req.originalUrl,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
      })
      return res.status(403).json({ message: "Insufficient permissions" })
    }

    next()
  }
}

/**
 * ✅ Helper to generate JWT with full user data
 * Use this in login/register routes for token creation.
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  )
}
