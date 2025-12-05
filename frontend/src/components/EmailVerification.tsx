import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import "./Components.css";

interface EmailVerificationProps{
    onVerificationComplete: () => void;
}

export const EmailVerification = ({onVerificationComplete} : EmailVerificationProps) => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verifcation token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(
          response.data.message ||
            "Email successfully verified! You can now log in."
        );

        // clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect login after 3 seconds
        setTimeout(() => {
          onVerificationComplete();
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.error || "Verifcation failed. Please try again."
        );
      }
    };
    verifyEmail();
  }, [onVerificationComplete]);

  return (
    <div className="login-container">
      <h2>Email Verification</h2>
      {status === "loading" && (
        <div>
          <p>Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div style={{ color: "green"}}>
            <p>{message}</p>
            <p>Redirecting to login...</p>
        </div>
      )}

      {status === "error" && (
        <div style={{ color: "red"}}>
            <p>{message}</p>
            <button onClick={onVerificationComplete}>Return to login</button>
        </div>
      )}
    </div>
  );
};
