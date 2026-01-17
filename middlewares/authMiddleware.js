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
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Invalid Token"
      });
    }

    // Verify refresh token first
    try {
      verifyRefreshToken(refreshToken);
    } catch (refreshError) {
      clearRefreshTokenCookie(res);

      if (refreshError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token Expired"
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid Token"
        });
      }
    }

    // Verify access token
    try {
      const verified = verifyToken(token);
      req.userId = verified.userId;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token Expired"
        });
      } else {
        // clearRefreshTokenCookie(res);
        return res.status(401).json({
          success: false,
          message: "Invalid Token"
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
