import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Karzina from "@/models/karzina";

export async function GET() {
  await dbConnect();
  const all = await Karzina.find().sort({ deletedAt: -1 });
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const newItem = await Karzina.create(data);
  return NextResponse.json({ success: true, data: newItem });
}

export async function DELETE(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    await Karzina.findByIdAndDelete(id);
  } else {
    // 🔥 Hammasini o‘chirish
    await Karzina.deleteMany({});
  }

  return NextResponse.json({ success: true });
}
