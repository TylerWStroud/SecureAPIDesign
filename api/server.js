import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { authenticate } from "./middleware/auth.js";
import { requireRole } from "./middleware/requireRole.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import mongoose from "mongoose";

dotenv.config();
const app = express();

await connectDB();

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',  // local development
  'https://secureapidemo.vercel.app'  // production frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(rateLimiter);

// *** Health (with timestamp & uptime) - Admin only ***
app.get("/health", authenticate, requireRole("admin"), async (_req, res) => {
  const startTime = Date.now();
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.round(process.uptime())}s`,
    checks: {},
  };

  // ==== CHECKS MONGO_DB CONNECTION ====
  try {
    // reads database state
    const dbState = mongoose.connection.readyState;
    // status mapping options
    const dbStateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    // checks for connectivity, returns connection state, and connected DB name
    healthStatus.checks.database = {
      status: dbState === 1 ? "healthy" : "unhealthy",
      state: dbStateMap[dbState],
      name: mongoose.connection.name || "unknown",
    };

    // perform DB ping to verify responsiveness
    if (dbState === 1) {
      await mongoose.connection.db.admin().ping();
      healthStatus.checks.database.ping = "success";
    }
  } catch (error) {
    healthStatus.checks.database = {
      status: "unhealthy",
      error: error.message,
    };
    healthStatus.status = "unhealthy";
  }

  // ==== CHECKS MEMORY USAGE ====
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    // Resident Set Size (rss), is the amount of space occupied in the main memory device
    // (that is a subset of the total allocated memory) for the process,
    // including all C++ and JavaScript objects and code.
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  healthStatus.checks.memory = {
    status: memUsageMB.heapUsed < 500 ? "healthy" : "warning", // warning if memory usage is over 500MB
    usage: memUsageMB,
    unit: "MB",
  };

  // ==== CHECK RESPONSE TIME ====
  healthStatus.responseTime = `${Date.now() - startTime}ms`;

  //  ==== SETS HTTP STATUS BASED ON OVERALL HEALTH ====
  const statusCode = healthStatus.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthStatus);

  // OLD STATUS CHECK CODE
  // res.json({
  //   status: "healthy",
  //   timestamp: new Date().toISOString(),
  //   uptime: `${Math.round(process.uptime())}s`
  // })
});

// Routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Fallback
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure REST API running on port ${PORT}`));
