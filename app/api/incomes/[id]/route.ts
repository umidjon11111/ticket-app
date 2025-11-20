import { dbConnect } from "@/lib/db";
import StockIncome from "@/models/StockIncome";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: any) {
  await dbConnect();
  await StockIncome.findByIdAndDelete(params.id);

  return NextResponse.json({ ok: true });
}
