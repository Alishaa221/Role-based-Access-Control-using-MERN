import React from "react"
import ReactDOM from "react-dom/client"
import RootApp from "./RootApp.jsx"
import { ThemeProvider } from "./ThemeContext.jsx"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <RootApp />
    </ThemeProvider>
  </React.StrictMode>
)
