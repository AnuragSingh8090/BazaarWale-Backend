import jwt from "jsonwebtoken";

export const TOKEN_CONFIG = {
  TOKEN_EXPIRY: "10m",
  REFRESH_TOKEN_EXPIRY: "7d",
  REFRESH_TOKEN_COOKIE_NAME: "refreshToken",
  REFRESH_TOKEN_COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  },
};

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: TOKEN_CONFIG.TOKEN_EXPIRY,
    }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(
    TOKEN_CONFIG.REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    TOKEN_CONFIG.REFRESH_TOKEN_COOKIE_OPTIONS
  );
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(TOKEN_CONFIG.REFRESH_TOKEN_COOKIE_NAME);
};

