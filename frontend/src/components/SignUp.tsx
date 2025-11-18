import React, { useState } from "react";
import { userService } from "../services/api";
import "./Components.css";

interface SignUpProps {
  onSignUpSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignUp = ({ onSignUpSuccess, onSwitchToLogin }: SignUpProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await userService.createUser({ username, password });
      // Success - notify parent and show success state
      onSignUpSuccess();
    } catch (err: any) {
      console.error("Sign up error:", err);
      if (err.response?.status === 400) {
        setError("Username already exists. Please choose a different one.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp} className="login-form">
        <div className="form-input">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username (min 3 characters)"
            required
            minLength={3}
          />
        </div>

        <div className="form-input">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password (min 6 characters)"
            required
            minLength={6}
          />
        </div>

        <div className="form-input">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
            minLength={6}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="auth-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};
