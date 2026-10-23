"use client";
// components/VisitTracker.tsx — บันทึกว่าผู้อ่านเปิดอ่านหน้านี้แล้ว (หน่วง 4 วินาทีกันการกดผ่าน) → ใช้แสดงความคืบหน้าในเส้นทางเรียนรู้
import { useEffect } from "react";
import { markVisited, type ItemType } from "@/lib/progress";

export function VisitTracker({ type, slug }: { type: ItemType; slug: string }) {
  useEffect(() => { const t = setTimeout(() => markVisited(type, slug), 4000); return () => clearTimeout(t); }, [type, slug]);
  return null;
}
