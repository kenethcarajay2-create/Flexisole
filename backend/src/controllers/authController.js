
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const googleClient = new OAuth2Client();

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
  };
}

// EXISTING ADMIN LOGIN
export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
      active: true,
    }).select("+password");

    const isValid = user
      ? await user.verifyPassword(password)
      : false;

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.json({
      success: true,
      message: "Admin login successful.",
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentAdmin(req, res) {
  return res.json({
    success: true,
    user: publicUser(req.user),
  });
}

// CUSTOMER GOOGLE SIGN-IN
export async function customerGoogleLogin(req, res, next) {
  try {
    const { credential } = req.body || {};
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "Google Sign-In is not configured.",
      });
    }

    if (
      typeof credential !== "string" ||
      credential.length < 50 ||
      credential.length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "Google sign-in credential is required.",
      });
    }

    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });

      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({
        success: false,
        message: "Google verification failed. Please try again.",
      });
    }

    if (
      !payload?.sub ||
      !payload?.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "A verified Google email is required.",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const name = (
      payload.name ||
      payload.given_name ||
      email.split("@")[0]
    ).trim().slice(0, 120);

    // Always identify linked Google accounts by Google's
    // stable sub value, not just the email address.
    let user = await User.findOne({ googleId });

    if (!user) {
      const existingEmailAccount = await User.findOne({
        email,
      });

      if (existingEmailAccount) {
        // Never allow Google login to grant access
        // to an existing admin or password account
        // without a separate account-linking process.
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists. " +
            "Please sign in using its existing method.",
        });
      }

      try {
        user = await User.create({
          name,
          email,
          googleId,
          avatar: "",
          role: "customer",
          active: true,
        });
      } catch (error) {
        // Handle another simultaneous registration.
        if (error.code === 11000) {
          user = await User.findOne({ googleId });

          if (!user) {
            return res.status(409).json({
              success: false,
              message:
                "This email is already registered. " +
                "Please use your existing sign-in method.",
            });
          }
        } else {
          throw error;
        }
      }
    }

    if (!user.active || user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer account is not available.",
      });
    }

    return res.json({
      success: true,
      message: "Google sign-in successful.",
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// CUSTOMER PROFILE — USED WHEN RESTORING LOGIN
export async function getCurrentCustomer(req, res) {
  return res.json({
    success: true,
    user: publicUser(req.user),
  });
}
