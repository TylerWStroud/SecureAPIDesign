// Hybrid rate limiter — token-based for authenticated users, IP-based for guests

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 min
const maxReq = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

const buckets = new Map(); // key -> { count, start }

export default function rateLimiter(req, res, next) {
  // Skip CORS preflight and health checks
  if (req.method === "OPTIONS" || req.path === "/health") return next();

  // Identify user uniquely by token or IP
  const token = req.headers.authorization?.split(" ")[1];
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const key = token ? `user:${token}` : `ip:${ip}`;

  const now = Date.now();
  const entry = buckets.get(key);

  // First request → create new entry
  if (!entry) {
    buckets.set(key, { count: 1, start: now });
    return next();
  }

  // Reset counter if time window expired
  if (now - entry.start > windowMs) {
    buckets.set(key, { count: 1, start: now });
    return next();
  }

  // Increment and enforce limit
  entry.count += 1;
  if (entry.count > maxReq) {
    return res.status(429).json({
      error: "Rate limit exceeded. Please wait before making more requests.",
      window: `${windowMs / 1000}s`,
      maxRequests: maxReq,
    });
  }

  // Update entry and continue
  buckets.set(key, entry);
  next();
}
