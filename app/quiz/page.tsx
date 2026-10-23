// app/quiz/page.tsx — แบบทดสอบจุดยืนทางปรัชญา (5 ข้อ) → สำนักที่ใกล้ที่สุด + รายการอ่านเฉพาะบุคคล
import type { Metadata } from "next";
import { Quiz, type Reading } from "@/components/Quiz";
import { SCHOOLS } from "@/lib/quiz";
import { resolveItem, getPath } from "@/lib/paths";

export const metadata: Metadata = { title: "แบบทดสอบจุดยืนทางปรัชญา", description: "ตอบ 5 ข้อ แล้วดูว่าคุณใกล้สำนักปรัชญาใด พร้อมรายการอ่านเฉพาะคุณ" };

export default function QuizPage() {
  // แปลง slug ในผลลัพธ์เป็นชื่อ/ลิงก์/สรุปบนเซิร์ฟเวอร์ ส่งให้ไคลเอนต์เฉพาะที่ต้องใช้
  const reading = Object.fromEntries(SCHOOLS.map((s) => {
    const pick = (type: "thinker" | "debate" | "term", slugs: string[]) => slugs.map((slug) => { const r = resolveItem({ type, slug }); return { title: r.title, href: r.href, summary: r.summary }; });
    const p = getPath(s.path);
    return [s.key, { thinkers: pick("thinker", s.thinkers), debates: pick("debate", s.debates), terms: pick("term", s.terms), path: { slug: s.path, title: p?.title ?? s.path, minutes: p?.totalMinutes ?? 0 } }];
  })) as Reading;
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-accent">Philosophical Stance Quiz</p>
      <h1 className="display-h1 mt-1">คุณคิดแบบนักปรัชญาสำนักไหน?</h1>
      <p className="lead-text mt-3 mb-10">ห้าคำถามเกี่ยวกับศีลธรรม ความจริง เสรีภาพ ความทุกข์ และสังคม ไม่มีถูกผิด คำตอบของคุณจะบอกว่าใกล้กับสำนักใด และควรเริ่มอ่านอะไร</p>
      <Quiz reading={reading} />
    </div>
  );
}
