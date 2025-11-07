"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "./api"
import { useTheme } from "./ThemeContext"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import "./Dashboard.css"

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([]) // 🆕 For user messages
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState("users")
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const { theme } = useTheme()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || user.role !== "admin") {
      navigate("/")
      return
    }
    setCurrentUser(user)
    fetchUsers()
  }, [navigate])

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/all")
      setUsers(response.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  // 🆕 Fetch messages for "Messages" tab
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await api.get("/messages", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(response.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch messages")
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/users/role/${userId}`, { role: newRole })
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${userId}`)
        fetchUsers()
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user")
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  // Stats
  const totalUsers = users.length
  const adminCount = users.filter((u) => u.role === "admin").length
  const editorCount = users.filter((u) => u.role === "editor").length
  const normalCount = users.filter((u) => u.role === "user").length

  const filteredUsers = users
    .filter((u) =>
      activeTab === "users"
        ? u.role === "user"
        : u.role === "admin" || u.role === "editor"
    )
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery) ||
        u.email.toLowerCase().includes(searchQuery)
    )

  // Chart Data
  const roleData = [
    { name: "Admins", value: adminCount },
    { name: "Editors", value: editorCount },
    { name: "Users", value: normalCount },
  ]

  const COLORS = ["#2E86C1", "#27AE60", "#F39C12"]

  return (
    <div className="dashboard">
      {/* ---------- Header ---------- */}
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-info">
          <span>
            {currentUser?.name} ({currentUser?.role})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* ---------- Summary Cards ---------- */}
      <div className="admin-summary">
        <div className="summary-card">
          <h2>👥 {totalUsers}</h2>
          <p>Total Registered Users</p>
        </div>
        <div className="summary-card">
          <h2>🛡️ {adminCount}</h2>
          <p>Admins</p>
        </div>
        <div className="summary-card">
          <h2>✍️ {editorCount}</h2>
          <p>Editors</p>
        </div>
        <div className="summary-card">
          <h2>👤 {normalCount}</h2>
          <p>Normal Users</p>
        </div>
      </div>

      {/* ---------- Role Chart ---------- */}
      <div style={{ margin: "20px auto", textAlign: "center", width: "100%" }}>
        <h3>📊 Role Distribution</h3>
        <ResponsiveContainer width="50%" height={250}>
          <PieChart>
            <Pie
              data={roleData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label
            >
              {roleData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          Members (Admins & Editors)
        </button>
        <button
          className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("messages")
            fetchMessages()
          }}
        >
          Messages
        </button>
      </div>

      {/* ---------- Search ---------- */}
      {activeTab !== "messages" && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="search-bar"
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>
      )}

      {/* ---------- Main Section ---------- */}
      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : activeTab === "messages" ? (
          // 🆕 Inbox Section
          <section className="users-section">
            <h2>📩 Inbox Messages</h2>
            {messages.length === 0 ? (
              <div className="placeholder-section">No new messages</div>
            ) : (
              <div className="table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Sender</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg._id}>
                        <td>{msg.senderName}</td>
                        <td>{msg.email}</td>
                        <td>{msg.message}</td>
                        <td>{new Date(msg.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          // Default Users or Members Section
          <section className="users-section">
            <h2>
              {activeTab === "users"
                ? "All Users"
                : "All Members (Admins & Editors)"}
            </h2>

            {filteredUsers.length === 0 ? (
              <div className="placeholder-section">No data available</div>
            ) : (
              <div className="table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleChangeRole(user._id, e.target.value)
                            }
                            className="role-select"
                          >
                            <option value="user">User</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ---------- Quick Actions ---------- */}
        <div className="quick-actions">
          <div className="action-card">➕ Add New User</div>
          <div className="action-card">📂 View Logs</div>
          <div className="action-card">📋 Export Data</div>
        </div>
      </main>
    </div>
  )
}
