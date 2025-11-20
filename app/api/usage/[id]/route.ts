import { dbConnect } from "@/lib/db";
import StockUsage from "@/models/StockUsage";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: any) {
  await dbConnect();
  await StockUsage.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
