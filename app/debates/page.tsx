// app/debates/page.tsx — ดัชนีข้อโต้แย้งและการทดลองทางความคิด
import type { Metadata } from "next";
import { getAllDebates } from "@/lib/debates";
import { DebateIndex } from "@/components/DebateIndex";

export const metadata: Metadata = { title: "ข้อโต้แย้งและการทดลองทางความคิด" };

export default function DebatesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-4xl font-bold">ข้อโต้แย้งและการทดลองทางความคิด</h1>
      <p className="mt-2 mb-8 max-w-prose text-muted">ปริศนา ข้อขัดแย้ง และปัญหาลำบากใจที่ใช้ทดสอบความคิดทางปรัชญา พร้อมจุดยืนของนักคิดแต่ละฝ่าย</p>
      <DebateIndex debates={getAllDebates()} />
    </div>
  );
}
