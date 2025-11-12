import { Router } from "express";
import { body, validationResult, param } from "express-validator";
import Product from "../models/Product.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/products (auth required)
router.get("/", authenticate, async (_req, res) => {
  const products = await Product.find();
  res.json({ data: products });
});

// POST /api/products (admin only)
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  body("name").isString().trim().isLength({ min: 2 }),
  body("price").isFloat({ min: 0 }),
  body("stock").optional().isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const product = await Product.create(req.body);
    res.status(201).json({ message: "Product created", data: product });
  }
);

// GET /api/products/:id (auth)
router.get(
  "/:id",
  authenticate,
  param("id").isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ data: { name: product.name, price: product.price, _id: product._id } });
  }
);

// DELETE /api/products/:id (admin)
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  param("id").isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  }
);

export default router;
