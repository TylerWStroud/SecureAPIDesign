import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();
const app = express();

await connectDB();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Health (with timestamp & uptime)
app.get("/health", (_req, res) =>
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.round(process.uptime())}s`
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Fallback
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure REST API running on port ${PORT}`));
