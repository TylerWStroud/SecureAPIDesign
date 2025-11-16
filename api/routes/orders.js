import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/orders (auth)
// Regular users see only their orders, admins see all orders
router.get("/", authenticate, async (req, res) => {
  const isAdmin = req.user.roles && req.user.roles.includes("admin");

  // If admin, return all orders; otherwise, filter by userId
  const query = isAdmin ? {} : { userId: req.user.id };
  const orders = await Order.find(query).sort({ createdAt: -1 });

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

    // Check if product is in stock
    if (product.stock <= 0) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    // Decrement stock by 1
    product.stock -= 1;
    await product.save();

    const order = await Order.create({
      userId: req.user.id,
      productId,
      productName: product.name,
      price: product.price,
      status: status || "pending"
    });

    res.status(201).json({
      message: "Order created",
      data: {
        _id: order._id,
        orderNumber: order.orderNumber,
        productName: order.productName,
        price: order.price,
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

    // Find the order to get the productId
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Increment the product stock back by 1
    const product = await Product.findById(order.productId);
    if (product) {
      product.stock += 1;
      await product.save();
    }

    // Delete the order
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  }
);

export default router;
