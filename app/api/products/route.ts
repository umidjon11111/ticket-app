import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ProductMahsulot from "@/models/ProductMahsulot";
import Sklad from "@/models/Sklad";

export async function GET() {
  await dbConnect();
  const data = await ProductMahsulot.find().populate("warehouse");
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const { name, unit, warehouse } = body;

  if (!name || !unit || !warehouse) {
    return NextResponse.json(
      { error: "name, unit, warehouse majburiy!" },
      { status: 400 }
    );
  }

  // ❗ warehouse mavjudligini tekshiramiz
  const wh = await Sklad.findById(warehouse);
  if (!wh) {
    return NextResponse.json({ error: "Sklad topilmadi!" }, { status: 400 });
  }

  const saved = await ProductMahsulot.create({
    name,
    unit,
    warehouse,
  });

  return NextResponse.json(saved);
}
