import { dbConnect } from "@/lib/db";
import ProductMahsulot from "@/models/ProductMahsulot";
import StockIncome from "@/models/StockIncome";
import StockUsage from "@/models/StockUsage";
import "@/models/Sklad";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const products = await ProductMahsulot.find().populate("warehouse");

  const result = [];

  for (let product of products) {
    // ✅ Kirim (quantity)
    const income = await StockIncome.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    // ✅ Sarf (amount)
    const usage = await StockUsage.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome = income[0]?.total || 0;
    const totalUsage = usage[0]?.total || 0;

    result.push({
      product: product.name,
      unit: product.unit,
      sklad: product.warehouse?.name || "-",
      income: totalIncome,
      usage: totalUsage,
      balance: totalIncome - totalUsage, // ✔ Endi to‘g‘ri minus bo‘ladi
    });
  }

  return NextResponse.json(result);
}
