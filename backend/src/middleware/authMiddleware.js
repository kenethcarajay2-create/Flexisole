
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    const match = authorization.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    let decoded;

    try {
      decoded = jwt.verify(match[1], process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    const user = await User.findOne({
      _id: decoded.sub,
      role: "admin",
      active: true,
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Administrator access denied.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
