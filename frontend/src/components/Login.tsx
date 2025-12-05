import React, { useState, useEffect } from "react";
import { api } from "../services/api"; // direct use of api instance
import "./Components.css";

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export const Login = ({ onLoginSuccess, onSwitchToSignUp }: LoginProps) => {
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
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(
          err.response?.data?.err ||
            "Please verify your email before logging in."
        );
      } else {
        setError("Invalid credentials. Please try again.");
      }
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
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-switch">
          Don't have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToSignUp}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};
