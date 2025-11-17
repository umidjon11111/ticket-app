import mongoose, { Schema, models } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: Object, ref: "Category" },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", productSchema);
export default Product;
