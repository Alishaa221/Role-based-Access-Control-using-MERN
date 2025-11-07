import express from "express"
import Message from "../models/Message.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// 📨 User sends a message
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user = req.user
    const newMessage = new Message({
      senderId: user.id,
      senderName: user.name,
      email: user.email,
      message: req.body.message
    })
    await newMessage.save()
    res.status(201).json({ message: "Message sent successfully" })
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" })
  }
})

// 📬 Admin fetches all messages
router.get("/", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" })
  }
  try {
    const messages = await Message.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" })
  }
})

export default router
