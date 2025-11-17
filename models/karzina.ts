import mongoose from "mongoose";

// 🧩 Model (agar oldin yaratilmagan bo‘lsa)
const KarzinaSchema = new mongoose.Schema(
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
    deletedAt: { type: Date, default: Date.now },
  },
  { collection: "karzina" }
);

// Bir xil model ikki marta yaratilmasligi uchun tekshiramiz
const Karzina =
  mongoose.models.Karzina || mongoose.model("Karzina", KarzinaSchema);

export default Karzina;
