import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import App from "./App"         // Login
import App1 from "./App1"       // Admin dashboard
import App2 from "./App2"       // Editor dashboard
import App3 from "./App3"       // User dashboard
import Register from "./Register" // Registration page

export default function RootApp() {
  console.log("RootApp loaded"); // ✅ debug check

  return (
    <Router>
      <Routes>
        {/* 👇 When user opens '/', send to register */}
        <Route index element={<Navigate to="/register" replace />} />
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* 👇 Auth pages */}
        <Route path="/login" element={<App />} />
        <Route path="/register" element={<Register />} />

        {/* 👇 Role-based dashboards */}
        <Route path="/admin" element={<App1 />} />
        <Route path="/editor" element={<App2 />} />
        <Route path="/user" element={<App3 />} />

        {/* 👇 Catch any unknown routes */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  )
}
