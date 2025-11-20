import { NextResponse } from "next/server";
import Sklad from "@/models/Sklad";
import { dbConnect } from "@/lib/db";

export async function PUT(req: Request, { params }: any) {
  await dbConnect();
  const body = await req.json();

  const updated = await Sklad.findByIdAndUpdate(
    params.id,
    { name: body.name },
    { new: true }
  );

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: any) {
  await dbConnect();

  const { id } = await context.params; // <-- MUHIM

  await Sklad.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
