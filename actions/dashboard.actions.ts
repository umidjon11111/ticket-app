"use server";

import { dbConnect } from "@/lib/db";
import CategoryCollection from "@/models/Category";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Karzina from "@/models/karzina";

export async function getDashboardStats() {
  await dbConnect();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const startOfDay = new Date(`${today}T00:00:00.000Z`);
  const endOfDay = new Date(`${today}T23:59:59.999Z`);

  const [categoryCount, productCount, todayKarzina] = await Promise.all([
    CategoryCollection.countDocuments(),
    Product.countDocuments(),

    Karzina.countDocuments({
      deletedAt: { $gte: startOfDay, $lte: endOfDay },
    }),
  ]);

  return {
    categoryCount,
    productCount,
    todayKarzina,
  };
}
