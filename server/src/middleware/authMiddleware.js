import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export function signAuthToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  };
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[env.cookieName];
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required. Please sign in." });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: "Session expired. Please sign in again." });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session. Please sign in again." });
  }
}
