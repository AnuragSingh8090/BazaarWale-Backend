import { verifyToken, verifyRefreshToken, TOKEN_CONFIG, clearRefreshTokenCookie } from "../services/tokenService.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ").at(-1)
      : null;
    
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token is required" });
    }

    const refreshToken = req.cookies[TOKEN_CONFIG.REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
        code: "REFRESH_TOKEN_NOT_FOUND"
      });
    }

    try {
      const verified = verifyToken(token);
      req.userId = verified.userId;
      
      try {
        verifyRefreshToken(refreshToken);
      } catch (refreshError) {
        clearRefreshTokenCookie(res);
        
        if (refreshError.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Session expired. Please login again.",
            code: "REFRESH_TOKEN_EXPIRED"
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "Invalid session. Please login again.",
            code: "INVALID_REFRESH_TOKEN"
          });
        }
      }
      
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please refresh your token.",
          code: "TOKEN_EXPIRED",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
          code: "INVALID_TOKEN",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Token verification failed",
          code: "TOKEN_VERIFICATION_FAILED",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
