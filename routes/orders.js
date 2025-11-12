import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/orders (auth)
router.get("/", authenticate, async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json({ data: orders, user: req.user });
});

// POST /api/orders (auth)
router.post(
  "/",
  authenticate,
  body("productId").isMongoId(),
  body("status").optional().isIn(["pending", "processing", "completed"]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId, status } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const order = await Order.create({
      userId: req.user.id,
      productId,
      productName: product.name,
      status: status || "pending"
    });

    res.status(201).json({
      message: "Order created",
      data: {
        _id: order._id,
        orderNumber: order.orderNumber,
        productName: order.productName,
        status: order.status
      }
    });
  }
);

// DELETE /api/orders/:id (admin only)
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  param("id").isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  }
);

export default router;
