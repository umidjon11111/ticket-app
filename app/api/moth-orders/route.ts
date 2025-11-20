import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import MothKarzina from "@/models/oylik-karzina";

// 📌 GET — barcha oylik statistikalar
export async function GET() {
  await dbConnect();

  const data = await MothKarzina.aggregate([
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$deletedAt" },
          month: { $month: "$deletedAt" },
          year: { $year: "$deletedAt" },
        },
        totalOrders: { $sum: 1 },
        cancelled: {
          $sum: {
            $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
          },
        },
        totalSum: {
          $sum: {
            $sum: {
              $map: {
                input: "$items",
                as: "i",
                in: { $multiply: ["$$i.qty", "$$i.price"] },
              },
            },
          },
        },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
  ]);

  const result = data.map((d) => ({
    date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(
      d._id.day
    ).padStart(2, "0")}`,
    totalOrders: d.totalOrders,
    cancelled: d.cancelled,
    totalSum: d.totalSum,
  }));

  return NextResponse.json(result);
}

// 📌 DELETE — oylik MothKarzina ni tozalash
export async function DELETE() {
  await dbConnect();
  await MothKarzina.deleteMany({});
  return NextResponse.json({ ok: true, message: "Oylik arxiv tozalandi!" });
}
