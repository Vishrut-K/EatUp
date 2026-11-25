import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    dishId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    isVeg: { type: Boolean, required: true },
    image: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerName: { type: String, required: true }
  },
  { _id: false }
);

const participantShareSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    itemCount: { type: Number, required: true, min: 0 },
    itemsSubtotal: { type: Number, required: true, min: 0 },
    deliveryShare: { type: Number, required: true, min: 0 },
    platformShare: { type: Number, required: true, min: 0 },
    gstShare: { type: Number, required: true, min: 0 },
    totalOwed: { type: Number, required: true, min: 0 },
    paymentResponsibilityStatus: {
      type: String,
      enum: ["unpaid", "settled"],
      default: "unpaid"
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    orderType: { type: String, enum: ["solo", "group"], default: "solo" },
    groupOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "GroupOrder", default: null },
    roomCode: { type: String, default: null },
    placedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    placedByName: { type: String, required: true },
    placedByEmail: { type: String, required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    totals: {
      itemCount: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      gst: { type: Number, required: true },
      grandTotal: { type: Number, required: true }
    },
    participantShares: { type: [participantShareSchema], default: [] },
    recipientName: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryPhone: { type: String, required: true },
    paymentMethod: { type: String, default: "Cash on Delivery (Demo)" },
    status: {
      type: String,
      enum: ["Order Placed", "Preparing", "Out for Delivery", "Delivered"],
      default: "Order Placed"
    }
  },
  { timestamps: true }
);

orderSchema.index({ "participantShares.userId": 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
