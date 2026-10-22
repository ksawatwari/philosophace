"use client";
// components/DebatePoll.tsx — การ์ดโพล/แผนผังการตัดสินใจ: เลือกคำตอบแล้วเปิดดูการวิเคราะห์เชิงปรัชญา
// สถิติเก็บเฉพาะในเบราว์เซอร์นี้ (localStorage) — ไม่มีเซิร์ฟเวอร์รวมผล จึงไม่แสดงตัวเลข “ชุมชน” ที่ไม่มีจริง
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, RotateCcw, GitBranch } from "lucide-react";

type Opt = { label: string; reveal: string; holders: string[] };
type Store = { choice: number | null; counts: number[] };

export function DebatePoll({ slug, question, options, names }: { slug: string; question: string; options: Opt[]; names: Record<string, string> }) {
  const key = `poll:${slug}`;
  const [st, setSt] = useState<Store>({ choice: null, counts: options.map(() => 0) });

  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) { const v = JSON.parse(raw) as Store; if (v.counts?.length === options.length) setSt(v); } } catch {}
  }, [key, options.length]);

  const save = (v: Store) => { setSt(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };
  const pick = (i: number) => {
    if (st.choice === i) return;
    const counts = [...st.counts];
    if (st.choice !== null) counts[st.choice] = Math.max(0, counts[st.choice] - 1); // เปลี่ยนคำตอบ = ย้ายคะแนน ไม่นับซ้ำ
    counts[i] += 1;
    save({ choice: i, counts });
  };
  const total = st.counts.reduce((a, b) => a + b, 0);
  const chosen = st.choice !== null ? options[st.choice] : null;

  return (
    <section aria-label="โพลตัดสินใจ" className="not-prose rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent"><GitBranch size={16} aria-hidden /> ลองตัดสินใจก่อนอ่าน</p>
      <h2 className="mt-2 text-xl font-semibold leading-snug">{question}</h2>

      <div role="radiogroup" aria-label="ตัวเลือก" className="mt-4 grid gap-2.5">
        {options.map((o, i) => {
          const on = st.choice === i;
          const pct = total ? Math.round((st.counts[i] / total) * 100) : 0;
          return (
            <button key={i} role="radio" aria-checked={on} onClick={() => pick(i)}
              className={`relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all ${on ? "border-verdigris bg-verdigris/10 ring-1 ring-verdigris" : "border-line hover:border-verdigris/60 hover:bg-sunk"}`}>
              {chosen && <motion.span aria-hidden initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="absolute inset-y-0 left-0 bg-lapis/10" />}
              <span className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5"><span className={`grid h-5 w-5 place-items-center rounded-full border text-[0.65rem] ${on ? "border-verdigris bg-verdigris text-paper" : "border-line text-muted"}`}>{on ? <CheckCircle2 size={13} /> : String.fromCharCode(65 + i)}</span>{o.label}</span>
                {chosen && <span className="text-sm tabular-nums text-muted">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {chosen && (
          <motion.div key={st.choice} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="mt-5 rounded-xl border-l-4 border-verdigris bg-verdigris/5 p-4">
            <p className="text-sm font-bold text-verdigris">การวิเคราะห์เชิงปรัชญา</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">{chosen.reveal}</p>
            {chosen.holders.length > 0 && (
              <p className="mt-2 text-sm text-muted">นักคิดที่ใกล้เคียง: {chosen.holders.map((h, i) => <span key={h}>{i > 0 && ", "}<Link href={`/philosophy/${h}`} className="text-lapis underline">{names[h] ?? h}</Link></span>)}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>{chosen ? `สถิติจากเบราว์เซอร์นี้เท่านั้น (${total} โหวต) · ยังไม่มีเซิร์ฟเวอร์รวมผลของผู้อ่านทั้งหมด` : "เลือกข้อที่ใกล้เคียงสัญชาตญาณของคุณที่สุด แล้วดูว่านักคิดคิดอย่างไร"}</span>
        {chosen && <button onClick={() => save({ choice: null, counts: st.counts.map(() => 0) })} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-sunk hover:text-ink"><RotateCcw size={12} /> เริ่มใหม่</button>}
      </div>
    </section>
  );
}
