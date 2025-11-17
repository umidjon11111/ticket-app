"use server";

import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";

// Hammasini olish
export async function getCategories() {
  await dbConnect();
  const categories = await Category.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(categories));
}

// Qo‘shish
export async function addCategory(formData: FormData) {
  await dbConnect();
  const newCategory = new Category({
    name: formData.get("name"),
  });
  await newCategory.save();
}

// O‘chirish
export async function deleteCategory(id: string) {
  await dbConnect();
  await Category.findByIdAndDelete(id);
}

export async function EditCategory(id: string, formData: FormData) {
  await dbConnect();
  await Category.findByIdAndUpdate(id, {
    name: formData.get("name"),
  });
}
