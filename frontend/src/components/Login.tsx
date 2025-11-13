import React, { useState, useEffect } from "react";
import { api } from "../services/api"; // direct use of api instance
import "./Components.css";

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login = ({ onLoginSuccess } : LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");

  useEffect(() => {
    const msg = localStorage.getItem("sessionExpired");
    if (msg) {
      setSessionMessage(msg);
      localStorage.removeItem("sessionExpired");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { username, password });
      const { token } = res.data;
      if (!token) throw new Error("No token in response");
      localStorage.setItem("authToken", token);
      onLoginSuccess();
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {sessionMessage && (
        <div style={{ color: "orange", marginBottom: 10 }}>
          {sessionMessage}
        </div>
      )}

      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-input">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin or user"
            required
          />
        </div>
        <div className="form-input">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123 or user123"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
