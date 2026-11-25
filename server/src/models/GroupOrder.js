import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: true }
  },
  { _id: false }
);

const groupCartItemSchema = new mongoose.Schema(
  {
    dishId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    isVeg: { type: Boolean, required: true },
    image: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
    addedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true }
    },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const groupOrderSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    creatorName: { type: String, required: true },
    restaurantId: { type: String, default: null }, // Restaurant.legacyId
    restaurantName: { type: String, default: null },
    status: {
      type: String,
      enum: ["open", "locked", "finalized", "cancelled"],
      default: "open",
      index: true
    },
    participants: { type: [participantSchema], default: [] },
    items: { type: [groupCartItemSchema], default: [] },
    finalOrderNumber: { type: String, default: null },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  },
  { timestamps: true }
);

export const GroupOrder = mongoose.model("GroupOrder", groupOrderSchema);
