import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { getAuthCookieOptions, signAuthToken } from "../middleware/authMiddleware.js";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters.").max(80),
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long.").max(128)
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required.").max(128)
});

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid registration details."
    });
  }

  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: "An account with this email already exists." });
  }

  const saltRounds = env.isProd ? 12 : 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = await User.create({ name, email, passwordHash });

  const token = signAuthToken(user._id.toString());
  res.cookie(env.cookieName, token, getAuthCookieOptions());

  return res.status(201).json({
    success: true,
    user: user.toSafeObject()
  });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || "Email and password are required."
    });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const token = signAuthToken(user._id.toString());
  res.cookie(env.cookieName, token, getAuthCookieOptions());

  return res.json({
    success: true,
    user: user.toSafeObject()
  });
}

export async function logout(req, res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    path: "/"
  });
  return res.json({ success: true, message: "Signed out successfully." });
}

export async function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user.toSafeObject()
  });
}
