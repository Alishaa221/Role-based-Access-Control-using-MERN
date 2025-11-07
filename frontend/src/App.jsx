import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "./api"
import "./index.css"
import { useTheme } from "./ThemeContext"

// Theme toggle button component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  )
}

export default function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    try {
      console.log("🔹 Sending login request...")
      const response = await api.post("/auth/login", { email, password })
      console.log("✅ Full response:", response)

      if (response.status === 200 && response.data?.token) {
        const data = response.data
        console.log("✅ Login response:", data)
        console.log("User role:", data.user.role)

        // Save token and user data
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect based on role
        const role = data.user.role
        if (role === "admin") {
          navigate("/admin")
        } else if (role === "editor") {
          navigate("/editor")
        } else {
          navigate("/user")
        }
      } else {
        setError("Login failed: Unexpected response from server.")
      }
    } catch (err) {
      console.error("❌ Login error:", err)
      setError(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="login-container">
      {/* 🌗 Theme toggle */}
      <ThemeToggle />

      <h1>Welcome Back</h1>
      <p style={{ fontSize: "14px", marginBottom: "20px" }}>
        Sign in to continue to your dashboard
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin} className="login-form" autoComplete="off">
        {/* Autofill prevention */}
        <input
          type="text"
          name="fakeusernameremembered"
          style={{ display: "none" }}
          autoComplete="off"
        />
        <input
          type="password"
          name="fakepasswordremembered"
          style={{ display: "none" }}
          autoComplete="new-password"
        />

        <input
          type="email"
          placeholder="Email (Gmail only)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: 10, fontSize: "14px" }}>
        Don’t have an account?{" "}
        <b>
          <a href="/register">Register here</a>
        </b>
      </p>
    </div>
  )
}
