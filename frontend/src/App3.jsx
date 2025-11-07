"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useTheme } from "./ThemeContext"
import "./Dashboard.css"

const API_URL = "http://localhost:5000/api"

export default function UserDashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [userMessage, setUserMessage] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()
  const { theme } = useTheme()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || user.role !== "user") {
      navigate("/")
      return
    }
    setCurrentUser(user)
    fetchProfile()
  }, [navigate])

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

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  // ✅ Send message to admin
  const handleSendMessage = async () => {
    if (!userMessage.trim()) {
      setError("Message cannot be empty")
      return
    }
    setError("")
    setSuccessMsg("")

    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_URL}/messages`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccessMsg("✅ Message sent to admin successfully!")
      setUserMessage("")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message")
    }
  }

  return (
    <div className="dashboard">
      {/* ---------- Header ---------- */}
      <header className="dashboard-header">
        <h1>User Dashboard</h1>
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
        {successMsg && (
          <div
            style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "12px 16px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            {successMsg}
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* ✅ Profile Section */}
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
                <p className="info-text">
                  As a user, you have read-only access to your profile. Contact an admin if you
                  need more permissions.
                </p>
              </div>
            </section>

            {/* 🕓 Recent Activity */}
            <section className="activity-section">
              <h2>Recent Activity</h2>
              <ul className="activity-list">
                <li>🔹 Logged in on 06 Nov 2025 at 10:22 AM</li>
                <li>🔹 Viewed your profile</li>
                <li>🔹 Checked user guidelines</li>
              </ul>
            </section>

            {/* 📊 Account Overview */}
            <section className="progress-section">
              <h2>Account Overview</h2>
              <p>
                Your access level: <strong>Read-Only User</strong>
              </p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "40%" }}></div>
              </div>
              <p style={{ marginTop: "8px", fontSize: "14px", opacity: 0.8 }}>
                Account setup: 40% complete
              </p>
            </section>

            {/* 💬 Contact Admin */}
            <section className="contact-admin">
              <h2>Need Help?</h2>
              <textarea
                placeholder="Write a message to the admin..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="content-textarea"
              />
              <button onClick={handleSendMessage} className="save-btn">
                Send Message
              </button>
            </section>

            {/* 💡 Quote / Footer Section */}
            <section className="quote-section">
              <blockquote>
                “Knowledge is power, but sharing it is progress.” 💡
              </blockquote>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
