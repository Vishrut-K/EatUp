import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    dishId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    isVeg: { type: Boolean, required: true },
    image: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    restaurantId: { type: String, default: null }, // stores Restaurant.legacyId (e.g. "rest-1")
    restaurantName: { type: String, default: null },
    items: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
