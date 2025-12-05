import React, { useState, useEffect } from "react";
import { auditLogService, type AuditLog } from "../services/api";
import RefreshButton from "./RefreshButton";
import "./Components.css";

export const AuditLogList = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>("");

    const fetchLogs = async () => {
        setLoading(true);
        try{
            const res = await auditLogService.getAuditLogs({limit: 100});
            setLogs(res.data.data || []);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        if (!filter) return true;
        return log.action.toLowerCase().includes(filter.toLowerCase()) ||
                log.username?.toLowerCase().includes(filter.toLowerCase());
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };
    
    const getActionColor = (action: string) => {
      if (action.includes('FAILED') || action.includes('UNAUTHORIZED')) return '#ff6b6b';
      if (action.includes('LOGIN')) return '#4dabf7';
      if (action.includes('CREATED')) return '#51cf66';
      if (action.includes('DELETED')) return '#ffa94d';
      return '#868e96';
    };
    
    const getStatusBadge = (success: boolean, statusCode?: number) => {
      const color = success ? '#51cf66' : '#ff6b6b';
      return (
        <span style={{
          backgroundColor: color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.85em',
          fontWeight: 'bold'
        }}>
          {statusCode || (success ? '200' : '500')}
        </span>
      );
    };

    return (
      <div className="section-container">
        <div className="section-header">
          <h2>Audit Logs</h2>
          <div className="refresh-wrapper">
            <RefreshButton onClick={fetchLogs} />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Filter by action or username..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)'
            }}
          />
        </div>

        {loading && <p>Loading audit logs...</p>}

        <div className="item-container">
          {filteredLogs.length > 0 ? (
            <div style={{ width: '100%' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9em'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Timestamp</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>IP Address</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log._id} style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: log.success ? 'transparent' : 'rgba(255, 107, 107, 0.1)'
                    }}>
                      <td style={{ padding: '12px' }}>
                        {formatDate(log.createdAt)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {log.username || 'Anonymous'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          color: getActionColor(log.action),
                          fontWeight: '500'
                        }}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {getStatusBadge(log.success, log.statusCode)}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.85em' }}>
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {log.errorMessage ? (
                          <span style={{ color: '#ff6b6b' }}>{log.errorMessage}</span>
                        ) : log.details && Object.keys(log.details).length > 0 ? (
                          <details>
                            <summary style={{ cursor: 'pointer' }}>View</summary>
                            <pre style={{
                              fontSize: '0.8em',
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: 'var(--bg-secondary)',
                              borderRadius: '4px',
                              overflow: 'auto'
                            }}>
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No audit logs found.</p>
          )}
        </div>
      </div>
    );
};
