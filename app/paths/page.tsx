// app/paths/page.tsx — เส้นทางเรียนรู้ (Guided Learning Paths): การ์ดแสดงเวลาอ่านรวม ระดับความยาก ลำดับขั้น และความคืบหน้า
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, ListOrdered } from "lucide-react";
import { getAllPaths, DIFFICULTY } from "@/lib/paths";
import { PathCardProgress } from "@/components/PathTracker";
import { Icon } from "@/components/Icon";
import { stepKey } from "@/lib/progress";

export const metadata: Metadata = { title: "เส้นทางเรียนรู้", description: "เส้นทางอ่านปรัชญาแบบมีลำดับ เหมาะกับมือใหม่และผู้สนใจเฉพาะด้าน" };

const Dots = ({ n }: { n: number }) => (
  <span className="inline-flex items-center gap-1" role="img" aria-label={`ระดับ ${DIFFICULTY[n]}`}>
    {[1, 2, 3].map((i) => <span key={i} className={`h-2 w-2 rounded-full ${i <= n ? "bg-accent" : "bg-line"}`} />)}
    <span className="ml-1">{DIFFICULTY[n]}</span>
  </span>
);

export default function PathsPage() {
  const paths = getAllPaths();
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold text-accent">Guided Learning Paths</p>
      <h1 className="display-h1 mt-1">เส้นทางเรียนรู้</h1>
      <p className="lead-text mt-3 max-w-2xl">ไม่รู้จะเริ่มอ่านตรงไหน? เลือกเส้นทางที่เรียงลำดับไว้แล้ว แต่ละขั้นบอกว่าทำไมต้องอ่านต่อจากขั้นก่อน และบันทึกความคืบหน้าในเบราว์เซอร์ของคุณ</p>
      <p className="mt-3 text-sm"><Link href="/quiz" className="text-lapis underline underline-offset-4">ยังไม่แน่ใจว่าชอบแนวไหน? ลองทำแบบทดสอบจุดยืน →</Link></p>

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {paths.map((p) => (
          <li key={p.slug}>
            <Link href={`/paths/${p.slug}`} className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-verdigris">
              <span className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-verdigris/10 text-verdigris"><Icon name={p.icon} size={22} /></span>
                <span className="text-xs font-semibold text-muted">เส้นทางที่ {p.order}</span>
              </span>
              <h2 className="mt-4 text-xl font-bold leading-snug group-hover:text-verdigris">{p.title}</h2>
              <p className="term-accent text-sm">{p.original}</p>
              <p className="mt-3 text-[15px] leading-relaxed">{p.summary}</p>

              <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                <div className="flex items-center gap-1.5"><Clock size={14} /><dt className="sr-only">เวลาอ่านรวม</dt><dd>~{p.totalMinutes} นาที</dd></div>
                <div className="flex items-center gap-1.5"><ListOrdered size={14} /><dt className="sr-only">จำนวนขั้น</dt><dd>{p.steps.length} ขั้น</dd></div>
                <div className="flex items-center gap-1.5 text-accent"><dt className="sr-only">ระดับ</dt><dd><Dots n={p.difficulty} /></dd></div>
              </dl>

              <ol className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs" aria-label="ลำดับขั้น">
                {p.steps.map((s, i) => (
                  <li key={s.type + s.slug} className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sunk px-2 py-0.5"><span className="font-bold text-verdigris">{i + 1}</span> {s.title}</span>
                    {i < p.steps.length - 1 && <ArrowRight size={11} className="text-muted" aria-hidden />}
                  </li>
                ))}
              </ol>

              <div className="mt-auto pt-5"><PathCardProgress slug={p.slug} keys={p.steps.map((s) => stepKey(s.type, s.slug))} /></div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
