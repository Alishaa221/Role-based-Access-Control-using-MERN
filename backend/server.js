import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan" // ✅ Added Morgan
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import { logEvent } from "./utils/logger.js" // ✅ Your logger stays the same
import messageRoutes from "./routes/messages.js"
dotenv.config()

const app = express()


// Middleware
app.use(cors())
app.use(express.json())

// ✅ Morgan request logging (for quick console feedback)
app.use(morgan("dev"))

// ✅ Custom structured logs for every incoming request
app.use((req, res, next) => {
  logEvent("info", "Incoming Request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  })
  next()
})

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err))

// ✅ Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/messages", messageRoutes)

// ✅ Basic route
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is running" })
})

// ✅ Global error-handling + security logging middleware
app.use((err, req, res, next) => {
  logEvent("error", "Unhandled Error", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
  })
  res.status(500).json({ message: "Internal Server Error" })
})

// ✅ Log 401/403 access attempts separately for tracing
app.use((req, res, next) => {
  if (res.statusCode === 401 || res.statusCode === 403) {
    logEvent("warn", "Unauthorized Access Attempt", {
      status: res.statusCode,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    })
  }
  next()
})

// ✅ Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

