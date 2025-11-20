import mongoose from "mongoose";

const StockIncomeSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductMahsulot",
    required: true,
  },
  quantity: { type: Number, required: true }, // ❗ Miqdor
  price: { type: Number, required: true },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sklad",
    required: true,
  }, // ❗ Qaysi skladga kelgan
});

export default mongoose.models.StockIncome ||
  mongoose.model("StockIncome", StockIncomeSchema);
