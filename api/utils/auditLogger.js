import AuditLog from "auditlog-logger";

/**
 * Log an audit event
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - Action type (e.g., 'USER_LOGIN')
 * @param {Object} params.req - Express request object
 * @param {string} params.userId - User ID (optional)
 * @param {string} params.username - Username (optional)
 * @param {Object} params.details - Additional details (optional)
 * @param {boolean} params.success - Whether action succeeded (default: true)
 * @param {number} params.statusCode - HTTP status code (optional)
 * @param {string} params.errorMessage - Error message if failed (optional)
 */
export async function logAudit({
  action,
  req,
  userId = null,
  username = null,
  details = {},
  success = true,
  statusCode = 200,
  errorMessage = null,
}) {
  try {
    // Extract IP address (handle proxy/forwarding)
    const ipAddress =
      req.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;

    // Extract user agent
    const userAgent = req.headers["user-agent"];

    // If user info is in req.user (from auth middleware), use it
    if (!userId && req.user) {
      userId = req.user.id;
      username = req.user.username;
    }

    const auditEntry = await AuditLog.create({
      userId,
      username,
      action,
      details,
      ipAddress,
      userAgent,
      statusCode,
      success,
      errorMessage,
    });

    console.log(
      `[AUDIT] ${action} by ${username || "anonymous"} - ${
        success ? "SUCCESS" : "FAILED"
      }`
    );
    return auditEntry;
  } catch (error) {
    // Don't let audit logging failure break the app
    console.error("Failed to create audit log:", error);
    return null;
  }
}
