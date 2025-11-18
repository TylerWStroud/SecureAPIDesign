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
  const orders = await Order.find(query)
    .populate('userId', 'username')
    .sort({ createdAt: -1 });

  // Transform orders to have separate userId and username fields
  const transformedOrders = orders.map(order => {
    const orderObj = order.toObject();
    // Handle both populated (object) and non-populated (string) userId
    const isPopulated = orderObj.userId && typeof orderObj.userId === 'object';
    return {
      ...orderObj,
      username: isPopulated ? orderObj.userId.username : null,
      userId: isPopulated ? orderObj.userId._id.toString() : orderObj.userId
    };
  });

  res.json({ data: transformedOrders, user: req.user });
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

    // Atomically decrement stock only if stock > 0
    // This prevents race conditions by making the check and decrement atomic
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        stock: { $gt: 0 }  // Only update if stock > 0
      },
      {
        $inc: { stock: -1 }  // Atomically decrement by 1
      },
      {
        new: true  // Return the updated document
      }
    );

    // If product is null, either it doesn't exist or is out of stock
    if (!product) {
      const productExists = await Product.findById(productId);
      if (!productExists) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(400).json({ error: "Product is out of stock" });
    }

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

    // Atomically increment the product stock back by 1
    await Product.findByIdAndUpdate(
      order.productId,
      { $inc: { stock: 1 } }  // Atomically increment by 1
    );

    // Delete the order
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  }
);

export default router;
