export function requireRole(...roles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const allowed = userRoles.some((r) => roles.includes(r));
    if (!allowed) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}
