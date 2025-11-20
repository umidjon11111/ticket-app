import { NextResponse } from "next/server";
import { getDailyReport } from "@/actions/karzina.actions";

export async function GET() {
  const report = await getDailyReport();
  return NextResponse.json(report);
}
