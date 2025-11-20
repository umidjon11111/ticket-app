import { dbConnect } from "@/lib/db";
import StockUsage from "@/models/StockUsage";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const data = await StockUsage.find()
    .populate("product")
    .sort({ createdAt: -1 });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const saved = await StockUsage.create({
    product: body.product,
    quantity: body.quantity,
    type: body.type, // daily, waste, manual
  });

  return NextResponse.json(saved);
}
