import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import StockUsage from "@/models/StockUsage";

export async function GET() {
  await dbConnect();
  const list = await StockUsage.find()
    .populate("product")
    .sort({ createdAt: -1 });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await dbConnect();

  const { product, amount, reason } = await req.json();

  if (!product || !amount)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const usage = await StockUsage.create({
    product,
    amount: Number(amount),
    reason,
  });

  return NextResponse.json(usage);
}
