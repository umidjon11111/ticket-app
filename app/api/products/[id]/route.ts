import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ProductMahsulot from "@/models/ProductMahsulot";

export async function PUT(req: Request, { params }: any) {
  await dbConnect();
  const body = await req.json();

  const updated = await ProductMahsulot.findByIdAndUpdate(
    params.id,
    {
      name: body.name,
      unit: body.unit,
      warehouse: body.warehouse,
    },
    { new: true }
  );

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: any) {
  await dbConnect();

  const { id } = await context.params; // <-- MUHIM

  await ProductMahsulot.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
