import { useState } from "react"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = () => {
    alert(`Signup with Email: ${email}, Password: ${password}`)
    // Later: call backend API to create user
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 400, margin: "0 auto" }}>
      <h1>Sign Up</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <button
        onClick={handleSignup}
        style={{ width: "100%", padding: 12, backgroundColor: "#2575fc", color: "white", border: "none", borderRadius: 6 }}
      >
        Sign Up
      </button>
    </div>
  )
}
