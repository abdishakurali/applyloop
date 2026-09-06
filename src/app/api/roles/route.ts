import { NextRequest, NextResponse } from "next/server";
import { JOB_TITLES } from "@/lib/roleTitles";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results = JOB_TITLES.filter((title) => title.toLowerCase().includes(q)).slice(0, 8);
  return NextResponse.json({ results });
}
