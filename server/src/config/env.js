import dotenv from "dotenv";

dotenv.config();

const parseClientOrigins = (raw) => {
  if (!raw) return ["http://localhost:5173"];
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "eatup_dev_fallback_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: process.env.COOKIE_NAME || "eatup_token",
  clientOrigins: parseClientOrigins(process.env.CLIENT_URL)
};
