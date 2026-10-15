
import jwt from "jsonwebtoken";

import User from "../models/User.js";

export async function requireCustomer(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required.",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Invalid customer session.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
    } catch {
      return res.status(401).json({
        success: false,
        message: "Customer session expired or invalid.",
      });
    }

    if (!decoded.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid customer session.",
      });
    }

    const user = await User.findById(decoded.sub);

    if (!user || !user.active || user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access denied.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
