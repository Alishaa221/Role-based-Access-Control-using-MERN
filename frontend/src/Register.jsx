import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "./api"
import "./index.css"
import { useTheme } from "./ThemeContext"

// 🌗 Theme Toggle Component
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

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordChecks, setPasswordChecks] = useState({
    lower: false,
    upper: false,
    number: false,
    special: false,
    length: false,
  })
  const navigate = useNavigate()

  // ✅ Validation Rules
  const rules = {
    lower: /[a-z]/,
    upper: /[A-Z]/,
    number: /\d/,
    special: /[!@#$%^&*]/,
    length: /^.{6,13}$/,
    gmail: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
  }

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === "password") {
      setPasswordChecks({
        lower: rules.lower.test(value),
        upper: rules.upper.test(value),
        number: rules.number.test(value),
        special: rules.special.test(value),
        length: rules.length.test(value),
      })
    }
  }

  // ✅ Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!rules.gmail.test(formData.email)) {
      setError("Only Gmail addresses are allowed (e.g., yourname@gmail.com).")
      return
    }

    const allPassed = Object.values(passwordChecks).every(Boolean)
    if (!allPassed) {
      setError("Password does not meet all the requirements.")
      return
    }

    try {
      const { data } = await api.post("/auth/register", formData)
      setSuccess("Registration successful! Redirecting to login...")
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    }
  }

  const renderRule = (passed, text) => (
    <p style={{ color: passed ? "green" : "red", fontSize: "13px", margin: "2px 0" }}>
      {passed ? "✔" : "✖"} {text}
    </p>
  )

  return (
    <div className="login-container">
      {/* 🌗 Theme Toggle */}
      <ThemeToggle />

      <h1>Create an Account</h1>
      <p style={{ fontSize: "14px", marginBottom: "15px" }}>
        Sign up to access your personalized dashboard
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* ✅ Disable Chrome Autofill */}
      <form
        id="registerForm"
        onSubmit={handleSubmit}
        className="login-form"
        autoComplete="off"
      >
        {/* Chrome autofill blockers */}
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
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="new-name"
          form="registerForm"
        />

        <input
          type="email"
          name="email"
          placeholder="Email (Gmail only)"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="off"
          form="registerForm"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
          form="registerForm"
        />

        {/* ✅ Password Checklist */}
        <div style={{ textAlign: "left", marginBottom: "10px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "4px" }}>
            Password must contain:
          </p>
          {renderRule(passwordChecks.lower, "A lowercase letter")}
          {renderRule(passwordChecks.upper, "A capital (uppercase) letter")}
          {renderRule(passwordChecks.number, "A number")}
          {renderRule(passwordChecks.special, "A special character")}
          {renderRule(passwordChecks.length, "Between 6 to 13 characters")}
        </div>

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: 10, fontSize: "14px" }}>
        Already have an account?{" "}
        <b>
          <a href="/login">Login here</a>
        </b>
      </p>
    </div>
  )
}
