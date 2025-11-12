import React, { useEffect, useState } from "react";
import { healthService } from "../services/api";
import RefreshButton from "./RefreshButton";
import "./Components.css";

export const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthService.checkHealth();
      setHealth(response.data);
    } catch (err) {
      setError("Failed to fetch health status.");
      console.error("Health check error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (loading) return <div>Checking health...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>API Health Check</h2>
        <div className="refresh-wrapper">
          <RefreshButton onClick={checkHealth} />
        </div>
      </div>

      {health && (
        <div className="health-info">
          <p>
            <strong>Status: </strong> {health.status}
          </p>
          <p>
            <strong>Timestamp: </strong> {health.timestamp}
          </p>
          <p>
            <strong>Uptime: </strong> {health.uptime}
          </p>
        </div>
      )}
    </div>
  );
};
