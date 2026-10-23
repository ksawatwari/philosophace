"use client";
// components/Quiz.tsx — แบบทดสอบจุดยืนทางปรัชญา 5 ข้อ → สำนักที่ใกล้ที่สุด + รายการอ่านเฉพาะบุคคล
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, User, MessagesSquare, BookMarked, Route } from "lucide-react";
import { QUESTIONS, SCHOOLS, scoreAnswers, type SchoolKey } from "@/lib/quiz";

type Item = { title: string; href: string; summary: string };
export type Reading = Record<SchoolKey, { thinkers: Item[]; debates: Item[]; terms: Item[]; path: { slug: string; title: string; minutes: number } }>;

export function Quiz({ reading }: { reading: Reading }) {
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));
  const [idx, setIdx] = useState(0);
  const finished = idx >= QUESTIONS.length;

  useEffect(() => { try { const raw = localStorage.getItem("quiz:last"); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a) && a.length === QUESTIONS.length && a.every((x: unknown) => typeof x === "number")) { setAnswers(a); setIdx(QUESTIONS.length); } } } catch {} }, []);
  const pick = (oi: number) => {
    const next = [...answers]; next[idx] = oi; setAnswers(next);
    setTimeout(() => { setIdx((i) => i + 1); if (idx === QUESTIONS.length - 1) { try { localStorage.setItem("quiz:last", JSON.stringify(next)); } catch {} } }, 220);
  };
  const restart = () => { setAnswers(QUESTIONS.map(() => null)); setIdx(0); try { localStorage.removeItem("quiz:last"); } catch {} };

  if (!finished) {
    const q = QUESTIONS[idx];
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between text-sm text-muted"><span>ข้อ {idx + 1} จาก {QUESTIONS.length} · {q.theme}</span>
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-sunk disabled:opacity-30"><ArrowLeft size={14} /> ย้อนกลับ</button></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunk"><motion.div className="h-full rounded-full bg-gradient-to-r from-verdigris to-lapis" animate={{ width: `${(idx / QUESTIONS.length) * 100}%` }} /></div>
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
            <h2 className="mt-8 text-2xl font-bold leading-snug">{q.text}</h2>
            <div role="radiogroup" aria-label={q.text} className="mt-6 grid gap-3">
              {q.options.map((o, oi) => (
                <button key={oi} role="radio" aria-checked={answers[idx] === oi} onClick={() => pick(oi)}
                  className={`rounded-2xl border px-5 py-4 text-left transition-all hover:-translate-y-0.5 ${answers[idx] === oi ? "border-verdigris bg-verdigris/10 ring-1 ring-verdigris" : "border-line bg-surface hover:border-verdigris/60"}`}>
                  <span className="mr-3 inline-grid h-6 w-6 place-items-center rounded-full bg-sunk text-xs font-bold text-muted">{String.fromCharCode(65 + oi)}</span>{o.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        <p className="mt-8 text-sm text-muted">ไม่มีคำตอบถูกผิด เลือกข้อที่ใกล้สัญชาตญาณของคุณที่สุด</p>
      </div>
    );
  }

  const ranked = scoreAnswers(answers);
  const top = ranked[0].school, second = ranked[1].school;
  const rd = reading[top.key], rd2 = reading[second.key];
  const Group = ({ title, Icon, items }: { title: string; Icon: typeof User; items: Item[] }) => (
    <div>
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-muted"><Icon size={15} /> {title}</h3>
      <ul className="mt-2 space-y-2">{items.map((i) => <li key={i.href}><Link href={i.href} className="block rounded-xl border border-line bg-surface p-3 hover:border-verdigris"><span className="font-semibold">{i.title}</span><span className="mt-0.5 line-clamp-2 block text-sm text-muted">{i.summary}</span></Link></li>)}</ul>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-line bg-gradient-to-br from-verdigris/10 via-surface to-accent/10 p-7 shadow-soft sm:p-9">
        <p className="text-sm font-semibold text-accent">จุดยืนที่ใกล้คุณที่สุด</p>
        <h2 className="display-h1 mt-1">{top.th}</h2>
        <p className="term-accent mt-1">{top.en}</p>
        <p className="lead-text mt-4 font-medium">“{top.tagline}”</p>
        <p className="mt-3 leading-relaxed">{top.description}</p>
        <p className="mt-4 text-sm text-muted">รองลงมา: <strong className="text-ink">{second.th}</strong> — ผลนี้เป็นเพียงภาพคร่าว ๆ จากห้าคำถาม ไม่ใช่การจัดประเภทบุคคล คนส่วนใหญ่ผสมหลายจุดยืน</p>
      </motion.section>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-5" aria-label="คะแนนทุกสำนัก">
        <h3 className="font-bold">คะแนนเทียบทุกสำนัก</h3>
        <ul className="mt-3 space-y-2.5">{ranked.map((r, i) => (
          <li key={r.school.key}><div className="flex justify-between text-sm"><span className={i === 0 ? "font-bold" : ""}>{r.school.th}</span><span className="tabular-nums text-muted">{r.pct}%</span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-sunk"><motion.div className={`h-full rounded-full ${i === 0 ? "bg-verdigris" : "bg-lapis/60"}`} initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} /></div></li>))}
        </ul>
      </section>

      <section className="mt-8" aria-label="รายการอ่านเฉพาะบุคคล">
        <h2 className="section-h2">รายการอ่านสำหรับคุณ</h2>
        <p className="mt-1 text-sm text-muted">เลือกจากสำนักหลักของคุณ แล้วเสริมด้วยมุมมองจาก {second.th} เพื่อให้เห็นอีกด้าน</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <Group title="นักคิด" Icon={User} items={rd.thinkers} />
          <Group title="ข้อโต้แย้งให้ลอง" Icon={MessagesSquare} items={rd.debates} />
          <Group title="ศัพท์ควรรู้" Icon={BookMarked} items={rd.terms} />
        </div>
        <div className="mt-6 rounded-2xl border border-line bg-sunk p-4">
          <h3 className="text-sm font-bold text-muted">ลองอ่านมุมมองตรงข้าม ({second.th})</h3>
          <p className="mt-1 flex flex-wrap gap-2 text-sm">{[...rd2.thinkers.slice(0, 2), ...rd2.debates.slice(0, 1)].map((i) => <Link key={i.href} href={i.href} className="rounded-full border border-line bg-surface px-3 py-1 text-lapis hover:border-verdigris">{i.title}</Link>)}</p>
        </div>
        <Link href={`/paths/${rd.path.slug}`} className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-verdigris p-4 text-paper hover:opacity-95">
          <span className="flex items-center gap-2 font-semibold"><Route size={18} /> เส้นทางเรียนรู้ที่แนะนำ: {rd.path.title} <span className="text-sm opacity-80">(~{rd.path.minutes} นาที)</span></span><ArrowRight size={18} />
        </Link>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-verdigris"><RotateCcw size={15} /> ทำใหม่</button>
        <Link href="/paths" className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-verdigris">ดูเส้นทางทั้งหมด</Link>
      </div>
    </div>
  );
}
