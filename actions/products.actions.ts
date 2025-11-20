"use server";

import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";

export async function getProducts() {
  await dbConnect();

  const products = await Product.find({}, "name price image available category")
    .sort({ createdAt: -1 })
    .populate("category", "name") // faqat name maydonini oladi
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export async function addProduct(formData: FormData) {
  await dbConnect();
  const newProduct = new Product({
    name: formData.get("name"),
    price: formData.get("price"),
    image: formData.get("image"),
    category: formData.get("category"),
  });
  await newProduct.save();
}

export async function deleteProduct(id: string) {
  await dbConnect();
  await Product.findByIdAndDelete(id);
}

export async function toggleAvailability(id: string) {
  await dbConnect();
  const product = await Product.findById(id);
  if (!product) return;
  product.available = !product.available;
  await product.save();
}
