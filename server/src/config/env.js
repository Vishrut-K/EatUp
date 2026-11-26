import dotenv from "dotenv";

dotenv.config();

const parseClientOrigins = (raw) => {
  if (!raw) return ["http://localhost:5173"];
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const isProd = process.env.NODE_ENV === "production";

if (isProd && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production!");
}

const clientOrigins = parseClientOrigins(process.env.CLIENT_URL);
if (clientOrigins.length === 0) {
  console.warn("[EatUp Config] CLIENT_URL resolved to an empty origin list.");
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProd,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "eatup_dev_only_fallback_NOT_FOR_PROD",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: process.env.COOKIE_NAME || "eatup_token",
  clientOrigins
};
