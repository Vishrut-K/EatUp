import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    dishId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    isVeg: { type: Boolean, required: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 4.5 },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    bestseller: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true }
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    legacyId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    cuisine: { type: [String], default: [] },
    rating: { type: Number, default: 4.5 },
    ratingCount: { type: String, default: "100+" },
    deliveryTime: { type: String, required: true },
    deliveryTimeMinutes: { type: Number, required: true },
    priceForTwo: { type: String, required: true },
    costNumeric: { type: Number, required: true },
    featured: { type: Boolean, default: false },
    discountBadge: { type: String, default: "" },
    image: { type: String, default: "" },
    address: { type: String, required: true },
    menu: { type: [menuItemSchema], default: [] }
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
