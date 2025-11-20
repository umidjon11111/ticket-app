import mongoose from "mongoose";

const ProductMahsulotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unit: {
      type: String,
      enum: ["kg", "l", "dona", "gr"],
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sklad", // ✔ model nomi bo'lishi shart
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductMahsulot ||
  mongoose.model("ProductMahsulot", ProductMahsulotSchema);
