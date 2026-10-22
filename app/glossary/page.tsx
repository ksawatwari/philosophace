// app/glossary/page.tsx — ดัชนีพจนานุกรม
import type { Metadata } from "next";
import { getAllTerms } from "@/lib/glossary";
import { GlossaryIndex } from "@/components/GlossaryIndex";

export const metadata: Metadata = { title: "พจนานุกรมศัพท์ปรัชญา" };

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-4xl font-bold">พจนานุกรมศัพท์ปรัชญา</h1>
      <p className="mt-2 mb-8 max-w-prose text-muted">ศัพท์สำคัญพร้อมคำต้นฉบับ บริบททางประวัติศาสตร์ และนักคิดที่เกี่ยวข้อง</p>
      <GlossaryIndex terms={getAllTerms()} />
    </div>
  );
}
