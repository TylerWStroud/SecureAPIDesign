import { Router } from "express";
import { query, validationResult} from "express-validator";
import AuditLog from "../models/AuditLog.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// Get /api/audit-logs (admin only)
router.get(
    "/",
    authenticate,
    requireRole("admin"),
    query("limit").optional().isInt({ min: 1, max: 1000}),
    query("offset").optional().isInt({ min: 0}),
    query("action").optional().isString(),
    query("userId").optional().isMongoId(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const action = req.query.action;
        const userId = req.query.userId;

        // Build query filter
        const filter = {};
        if (action) filter.action = action;
        if (userId) filter.userId = userId;

        try {
            const [logs, total] = await Promise.all([
                AuditLog.find(filter)
                .sort({ createdAt: -1})
                .skip(offset)
                .limit(limit)
                .lean(),
                AuditLog.countDocuments(filter),
            ]);

            res.json({ 
                data: logs,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + logs.length < total
                }
            });
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            res.status(500).json({ error: "Failed to fetch audit logs" });
        }
    }
);

export default router;