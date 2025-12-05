import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/emailService.js";
import { logAudit } from "../utils/auditLogger.js";

const router = Router();

// POST /auth/signup
router.post(
  "/signup",
  body("username").isString().trim().isLength({ min: 3 }),
  body("password").isString().isLength({ min: 6 }),
  body("email").isEmail(),
  body("firstName").isString().trim().isLength({ min: 1 }),
  body("lastName").isString().trim().isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password, email, firstName, lastName } = req.body;

    // Check if username or email already exists
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      if (existing.username === username) {
        return res.status(400).json({ error: "Username already exists" });
      }
      if (existing.email === email) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      email,
      firstName,
      lastName,
      roles: ["user"],
      emailVerificationToken: emailVerificationToken,
      emailVerificationExpires: emailVerificationExpires,
      isEmailVerified: process.env.ENABLE_EMAIL_VERIFICATION !== "true", // if verification disabled, mark as verified
    });

      // Log successful signup
      await logAudit({
        action: 'USER_SIGNUP',
        req,
        userId: user._id,
        username: user.username,
        details: { email, firstName, lastName },
        statusCode: 201
      });
    let emailSent = false;

    // Send verification email (if enabled)
    if (process.env.ENABLE_EMAIL_VERIFICATION === "true") {
      const emailResult = await sendVerificationEmail(
        email,
        firstName,
        emailVerificationToken
      );
      if (!emailResult.success) {
        // log error but don't fail signup
        return res
          .status(500)
          .json({ error: "Failed to send verification email" });
      }
      emailSent = emailResult.success;
    }
    return res.status(201).json({
      message:
        process.env.ENABLE_EMAIL_VERIFICATION === "true"
          ? "User created successfully. Please check your email to verify your account."
          : "User created successfully.",
      emailSent: emailSent,
    });
  }
);

// GET /auth/verify-email?token=...
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res
      .status(400)
      .json({ error: "Invalid or expired verification token" });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return res.json({
    message: "Email verified successfully! You can now log in.",
  });
});

// POST /auth/login
router.post(
  "/login",
  body("username").isString(),
  body("password").isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // check if email is verified (only if verification is enabled)
    if (
      process.env.ENABLE_EMAIL_VERIFICATION === "true" &&
      !user.isEmailVerified
    ) {
      return res.status(403).json({
        error:
          "Email not verified. Please verify your email before logging in. Check your inbox for the verification link.",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.json({ token });
  }
);

export default router;
