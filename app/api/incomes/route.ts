import { dbConnect } from "@/lib/db";
import StockIncome from "@/models/StockIncome";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const data = await StockIncome.find()
    .populate("product")
    .populate("warehouse")
    .sort({ createdAt: -1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  if (!body.product || !body.quantity || !body.price || !body.warehouse) {
    return NextResponse.json(
      { error: "product, quantity, price, warehouse majburiy!" },
      { status: 400 }
    );
  }

  const saved = await StockIncome.create({
    product: body.product,
    quantity: body.quantity,
    price: body.price,
    warehouse: body.warehouse,
  });

  return NextResponse.json(saved);
}
