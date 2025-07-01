import jwt from "jsonwebtoken";

export const authorization = async (req, res, next) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ").at(-1)
      : null;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }
    const isAuthorized = jwt.verify(token, process.env.JWT_SECRET);
    const userId = jwt.decode(token, process.env.JWT_SECRET);
    if (!isAuthorized) {
      return res.status(400).json({ success: false, message: "Invalid Token" });
    }
    req.userId = userId.userId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};
