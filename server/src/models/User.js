import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address."]
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    defaultPhone: {
      type: String,
      trim: true,
      default: "9876543210"
    },
    defaultAddress: {
      type: String,
      trim: true,
      default: "Flat 402, Sunshine Residency, Barakhamba Road, Connaught Place, New Delhi"
    }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    defaultPhone: this.defaultPhone,
    defaultAddress: this.defaultAddress,
    createdAt: this.createdAt
  };
};

export const User = mongoose.model("User", userSchema);
