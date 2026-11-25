import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { getAuthCookieOptions, signAuthToken } from "../middleware/authMiddleware.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res) {
  const name = (req.body?.name || "").trim();
  const email = (req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password || "";

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address." });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = signAuthToken(user._id.toString());
  res.cookie(env.cookieName, token, getAuthCookieOptions());

  return res.status(201).json({
    success: true,
    user: user.toSafeObject()
  });
}

export async function login(req, res) {
  const email = (req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password || "";

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    return res.status(401).json({ success: false, message: "No account found with this email." });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Incorrect password. Please try again." });
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
