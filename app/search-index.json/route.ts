// app/search-index.json/route.ts — ดัชนีค้นหาแบบ static (สร้างตอน build) ให้ GlobalSearch โหลดแบบ lazy ตอนเปิดครั้งแรก
import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/searchIndex";

export const dynamic = "force-static";
export function GET() { return NextResponse.json(buildSearchIndex()); }
