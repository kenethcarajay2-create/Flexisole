
import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";

// Fix MongoDB Atlas DNS resolution on local Windows PC.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

async function createAdmin() {
  try {
    const name = (process.env.ADMIN_NAME || "").trim();

    const email = (process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();

    const password = process.env.ADMIN_PASSWORD || "";

    if (!name || !email || password.length < 12) {
      throw new Error(
        "Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters) in .env."
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });

    if (existing) {
      throw new Error(
        "An account with this email already exists. No changes made."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      active: true,
    });

    console.log(`Admin account created: ${admin.email}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
