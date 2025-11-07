"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useTheme } from "./ThemeContext"
import "./Dashboard.css"

const API_URL = "http://localhost:5000/api"

export default function EditorDashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [content, setContent] = useState("")
  const [recentContent, setRecentContent] = useState([])
  const [progress, setProgress] = useState(0)

  const navigate = useNavigate()
  const { theme } = useTheme()

  // 🧭 Load editor profile
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || user.role !== "editor") {
      navigate("/")
      return
    }
    setCurrentUser(user)
    fetchProfile()
    loadRecentContent()
  }, [navigate])

  // 📦 Fetch profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile(response.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile")
    } finally {
      setLoading(false)
    }
  }

  // 🕒 Load recent content (dummy for now)
  const loadRecentContent = () => {
    const mock = [
      { title: "Weekly Report Summary", date: "2025-11-06" },
      { title: "System Maintenance Note", date: "2025-11-05" },
      { title: "User Guidelines Update", date: "2025-11-04" },
    ]
    setRecentContent(mock)
    setProgress(30) // simulate 30% of monthly target
  }

  // 💾 Save content (simulated)
  const handleSaveContent = () => {
    if (!content.trim()) {
      setError("Content cannot be empty")
      return
    }

    const newItem = { title: content.slice(0, 25) + "...", date: new Date() }
    setRecentContent([newItem, ...recentContent])
    setContent("")
    alert("✅ Content saved successfully!")
  }

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  // 💡 Random helpful tip
  const tips = [
    "Keep your content short and engaging.",
    "Always double-check your spelling before saving.",
    "Use clear formatting for readability.",
    "Focus on accuracy and structure.",
  ]
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return (
    <div className="dashboard">
      {/* ---------- Header ---------- */}
      <header className="dashboard-header">
        <h1>Editor Dashboard</h1>
        <div className="header-info">
          <span>
            {currentUser?.name} ({currentUser?.role})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* ---------- Main Section ---------- */}
      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* 👤 Profile Info */}
            <section className="profile-section">
              <h2>Your Profile</h2>
              <div className="profile-info">
                <p>
                  <strong>Name:</strong> {profile?.name}
                </p>
                <p>
                  <strong>Email:</strong> {profile?.email}
                </p>
                <p>
                  <strong>Role:</strong> {profile?.role}
                </p>
              </div>
            </section>

            {/* ✍️ Content Creation */}
            <section className="content-section">
              <h2>Create Content</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your content here..."
                className="content-textarea"
              />
              <p className="content-meta">
                {content.length} characters | {content.split(" ").filter(Boolean).length} words
              </p>
              <button onClick={handleSaveContent} className="save-btn">
                Save Content
              </button>

              {/* 💡 Helpful Tip */}
              <div className="tip-card">💡 <em>{randomTip}</em></div>

              {/* 📈 Progress */}
              <div className="progress-section">
                <p>Monthly Contribution: {progress}% completed</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </section>

            {/* 🕒 Recently Created Content */}
            <section className="recent-section">
              <h2>Recently Created Content</h2>
              {recentContent.length === 0 ? (
                <p>No content created yet.</p>
              ) : (
                <ul className="recent-list">
                  {recentContent.map((item, index) => (
                    <li key={index}>
                      <strong>{item.title}</strong>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
