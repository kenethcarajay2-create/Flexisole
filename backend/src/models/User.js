
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Optional for Google-only accounts.
    // Existing password-based admin accounts still work.
    password: {
      type: String,
      select: false,
      default: null,
    },

    // Google's stable account identifier.
    googleId: {
      type: String,
      trim: true,
      default: undefined,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      googleId: { $type: "string" },
    },
  }
);

userSchema.methods.verifyPassword = async function (password) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
