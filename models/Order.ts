import mongoose, { Schema, models } from "mongoose";

const orderSchema = new Schema(
  {
    orderId: { type: Number, required: true, unique: true },
    items: [{ name: String, qty: Number, price: Number }],
    status: {
      type: String,
      enum: ["new", "in_progress", "done"],
      default: "new",
    },
  },
  { timestamps: true }
);

const Order = models.Order || mongoose.model("Order", orderSchema);
export default Order;
