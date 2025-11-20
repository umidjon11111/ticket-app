import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import MothKarzina from "@/models/oylik-karzina";

export async function GET(req: Request, ctx: any) {
  await dbConnect();

  // params Promise bo‘lgani uchun await qilamiz:
  const { date } = await ctx.params;

  if (!date) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }

  // Sana bo‘yicha boshlanish va tugash
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  console.log("📅 START:", start);
  console.log("📅 END:", end);

  const orders = await MothKarzina.find({
    deletedAt: { $gte: start, $lte: end },
  });

  return NextResponse.json(orders);
}

export async function DELETE(req: Request, ctx: any) {
  await dbConnect();

  const { date } = await ctx.params;

  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  await MothKarzina.deleteMany({
    deletedAt: { $gte: start, $lte: end },
  });

  return NextResponse.json({ ok: true, message: "O'chirildi" });
}
