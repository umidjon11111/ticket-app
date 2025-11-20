import mongoose from "mongoose";

const StockUsageSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductMahsulot",
      required: true,
    },
    amount: { type: Number, required: true }, // qancha ishlatildi
    reason: {
      type: String,
      enum: ["daily", "waste", "manual"], // kundalik, chiqindi, qo‘lda
      default: "daily",
    },
  },
  { timestamps: true }
);

export default mongoose.models.StockUsage ||
  mongoose.model("StockUsage", StockUsageSchema);
