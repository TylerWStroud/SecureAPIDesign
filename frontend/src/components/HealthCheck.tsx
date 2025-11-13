import { useEffect, useState } from "react";
import { healthService, type HealthStatus } from "../services/api";
import RefreshButton from "./RefreshButton";
import { NoConnection, LoadingHG } from "../assets";
import "./Components.css";

export const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
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

  if (loading) return (
  <div style={{display: "flex", flexDirection: "column", gap: 10,  justifyContent: "center", alignItems: "center"}}>
    Checking health...
    <RefreshButton onClick={checkHealth}/>
    <img style={{width: "20rem", position: "relative"}}src={LoadingHG}/>
  </div>);
  if (error) return (
  <div style={{display: "flex", flexDirection: "column", gap: 10, justifyContent: "center", alignItems: "center"}}>
    Error: {error}
    <RefreshButton onClick={checkHealth}/>
    <img style={{width: "20rem", position: "relative"}}src={NoConnection}/>
    </div>);

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>API Health Check</h2>
        <div className="refresh-wrapper">
          <RefreshButton onClick={checkHealth} />
        </div>
      </div>

      {/* conditionally renders status styling dependening on status health */}
      {health && (
        <div className="health-info">
          <p>
            <strong>Status: </strong>
            <span
              className={
                health.status === "healthy"
                  ? "status-healthy"
                  : "status-unhealthy"
              }
            >
              {health.status.toUpperCase()}
            </span>
          </p>
          <p>
            <strong>Timestamp: </strong> {health.timestamp}
          </p>
          <p>
            <strong>Uptime: </strong> {health.uptime}
          </p>
          {health.responseTime && (
            <p>
              <strong>Response Time: </strong> {health.responseTime}
            </p>
          )}

          {/* conditionally renders Database information */}
          {health.checks?.database && (
            <div className="health-check-item">
              <h3>Database</h3>
              <p>Status: {health.checks.database.status}</p>
              {health.checks.database.state && (
                <p>State: {health.checks.database.state}</p>
              )}
              {health.checks.database.name && (
                <p>Name: {health.checks.database.name}</p>
              )}
              {health.checks.database.error && (
                <p className="health-check-error">
                  Error: {health.checks.database.error}
                </p>
              )}
            </div>
          )}

          {/*  conditionally renders memory heap usage  */}
          {health.checks?.memory && (
            <div className="health-check-item">
              <h3>Memory</h3>
              <p>Status: {health.checks.memory.status}</p>
              {health.checks.memory.usage && (
                <>
                  <p>Heap Used: {health.checks.memory.usage.heapUsed}</p>
                  <p>Heap Total: {health.checks.memory.usage.heapTotal}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
