import { NextResponse } from "next/server";
import Karzina from "@/models/karzina";
import { dbConnect } from "@/lib/db";
import MothKarzina from "@/models/oylik-karzina";

export async function POST() {
  await dbConnect();

  try {
    // 1. barcha kunlik karzina yozuvlarini olish
    const all = await Karzina.find().lean();

    if (all.length === 0) {
      return NextResponse.json({ ok: false, message: "Karzina bo'sh" });
    }

    // 2. Oylik karzinaga ko'chirish
    await MothKarzina.insertMany(all);

    // 3. Kunlik karzinani tozalash
    await Karzina.deleteMany({});

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("ERROR close-day →", error);
    return NextResponse.json({ ok: false, error });
  }
}
