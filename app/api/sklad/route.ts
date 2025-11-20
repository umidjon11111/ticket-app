import { dbConnect } from "@/lib/db";
import Sklad from "@/models/Sklad";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const data = await Sklad.find().sort({ createdAt: -1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const saved = await Sklad.create({ name: body.name });
  return NextResponse.json(saved);
}
