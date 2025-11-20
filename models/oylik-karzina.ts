import mongoose from "mongoose";

// 🧩 Model (agar oldin yaratilmagan bo‘lsa)
const MothKarzinaSchema = new mongoose.Schema(
  {
    orderId: Number,
    status: String,
    items: [
      {
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    OrderType: {
      type: String,
      enum: ["Zal", "Dastavka", "Saboy"],
      required: true,
    },
    deletedAt: { type: Date, default: Date.now },
  },
  { collection: "MothKarzina" }
);

// Bir xil model ikki marta yaratilmasligi uchun tekshiramiz
const MothKarzina =
  mongoose.models.MothKarzina ||
  mongoose.model("MothKarzina", MothKarzinaSchema);

export default MothKarzina;
