import fs from "fs"
import path from "path"

// Create a logs directory if it doesn’t exist
const logDir = path.resolve("logs")
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)

const logFile = path.join(logDir, "app.log")

export function logEvent(level, message, meta = {}) {
  const timestamp = new Date().toISOString()
  const entry = JSON.stringify({ timestamp, level, message, ...meta }) + "\n"

  fs.appendFile(logFile, entry, (err) => {
    if (err) console.error("Failed to write log:", err)
  })

  // Also print to console for visibility
  console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`, meta)
}
