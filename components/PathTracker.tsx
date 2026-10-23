"use client";
// components/PathTracker.tsx — ตัวติดตามความคืบหน้าของเส้นทางเรียนรู้ + ป้ายความคืบหน้าบนการ์ด
// ขั้นที่ “เสร็จ” = เปิดอ่านหน้านั้นแล้ว (VisitTracker) หรือกดทำเครื่องหมายเอง; เก็บใน localStorage ของเบราว์เซอร์นี้
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Clock, User, BookMarked, MessagesSquare, PartyPopper } from "lucide-react";
import { readManual, readVisited, stepKey, toggleManual } from "@/lib/progress";
import type { ResolvedStep } from "@/lib/paths";

const TYPE = { thinker: { th: "นักคิด", Icon: User }, debate: { th: "ข้อโต้แย้ง", Icon: MessagesSquare }, term: { th: "ศัพท์", Icon: BookMarked } } as const;

function useDone(path: string, keys: string[]) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const refresh = useCallback(() => {
    const v = readVisited(), m = readManual(path);
    setDone(new Set(keys.filter((k) => v.has(k) || m.has(k))));
  }, [path, keys.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    refresh();
    window.addEventListener("progress-change", refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("progress-change", refresh); window.removeEventListener("storage", refresh); };
  }, [refresh]);
  return { done, refresh };
}

export function PathCardProgress({ slug, keys }: { slug: string; keys: string[] }) {
  const { done } = useDone(slug, keys);
  const pct = Math.round((done.size / keys.length) * 100);
  return (
    <div aria-label={`ความคืบหน้า ${done.size} จาก ${keys.length} ขั้น`}>
      <div className="flex items-center justify-between text-xs text-muted"><span>ความคืบหน้า</span><span className="tabular-nums">{done.size}/{keys.length} ขั้น</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunk"><div className="h-full rounded-full bg-verdigris transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function PathTracker({ slug, steps }: { slug: string; steps: ResolvedStep[] }) {
  const keys = steps.map((s) => stepKey(s.type, s.slug));
  const { done, refresh } = useDone(slug, keys);
  const pct = Math.round((done.size / steps.length) * 100);
  const next = steps.find((s) => !done.has(stepKey(s.type, s.slug)));
  const toggle = (s: ResolvedStep) => { toggleManual(slug, s.type, s.slug); refresh(); };

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft" role="status" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">{done.size === steps.length ? "จบเส้นทางแล้ว" : `อ่านแล้ว ${done.size} จาก ${steps.length} ขั้น`}</p>
          <span className="text-2xl font-bold tabular-nums text-verdigris">{pct}%</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-sunk"><motion.div className="h-full rounded-full bg-gradient-to-r from-verdigris to-lapis" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} /></div>
        {next ? (
          <Link href={next.href} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-verdigris px-4 py-2 text-sm font-semibold text-paper hover:opacity-90">
            {done.size === 0 ? "เริ่มขั้นแรก" : "อ่านขั้นถัดไป"}: {next.title} <ArrowRight size={15} />
          </Link>
        ) : <p className="mt-4 flex items-center gap-2 text-sm text-verdigris"><PartyPopper size={16} /> คุณอ่านครบทุกขั้นแล้ว ลองทำแบบทดสอบจุดยืนหรือเลือกเส้นทางอื่นต่อ</p>}
        <p className="mt-3 text-xs text-muted">ระบบนับขั้นว่าเสร็จเมื่อคุณเปิดอ่านหน้านั้นประมาณ 4 วินาที หรือกดทำเครื่องหมายเอง · เก็บในเบราว์เซอร์นี้เท่านั้น</p>
      </div>

      <ol className="relative mt-8 space-y-5 border-l-2 border-line pl-8">
        {steps.map((s, i) => {
          const k = stepKey(s.type, s.slug), isDone = done.has(k), T = TYPE[s.type];
          return (
            <li key={k} className="relative">
              <span aria-hidden className={`absolute -left-[2.85rem] top-4 grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold ${isDone ? "border-verdigris bg-verdigris text-paper" : "border-line bg-surface text-muted"}`}>{isDone ? <Check size={16} /> : i + 1}</span>
              <article className={`rounded-2xl border bg-surface p-5 shadow-soft transition-colors ${isDone ? "border-verdigris/50" : "border-line"}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="font-bold text-verdigris">ขั้นที่ {i + 1}</span>
                  <span className="inline-flex items-center gap-1"><T.Icon size={13} /> {T.th}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={13} /> ~{s.minutes} นาที</span>
                </div>
                <h3 className="mt-1.5 text-xl font-bold"><Link href={s.href} className="hover:text-verdigris">{s.title}</Link></h3>
                <p className="mt-2 text-[15px] leading-relaxed">{s.why}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{s.summary}</p>
                {s.also.length > 0 && (
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="text-muted">อ่านประกอบ:</span>
                    {s.also.map((a) => <Link key={a.type + a.slug} href={a.href} className="rounded-full border border-line px-2.5 py-0.5 text-lapis hover:border-verdigris">{a.title}</Link>)}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link href={s.href} className="inline-flex items-center gap-1.5 rounded-lg border border-verdigris px-3 py-1.5 text-sm font-semibold text-verdigris hover:bg-verdigris/10">เปิดอ่าน <ArrowRight size={14} /></Link>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted"><input type="checkbox" checked={isDone} onChange={() => toggle(s)} className="h-4 w-4 accent-[var(--verdigris)]" /> ทำเครื่องหมายว่าอ่านแล้ว</label>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
