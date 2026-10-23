// app/paths/[slug]/page.tsx — หน้าเส้นทางเรียนรู้หนึ่งเส้น: ภาพรวม ผลลัพธ์ที่คาดหวัง และไทม์ไลน์ขั้นพร้อมตัวติดตามความคืบหน้า
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, ListOrdered, Target, Users } from "lucide-react";
import { getAllPaths, getPath, DIFFICULTY } from "@/lib/paths";
import { PathTracker } from "@/components/PathTracker";
import { Icon } from "@/components/Icon";

export const dynamicParams = false;
export const generateStaticParams = () => getAllPaths().map((p) => ({ slug: p.slug }));
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPath(params.slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default function PathPage({ params }: { params: { slug: string } }) {
  const all = getAllPaths();
  const p = all.find((x) => x.slug === params.slug);
  if (!p) notFound();
  const others = all.filter((x) => x.slug !== p.slug);
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/paths" className="text-sm text-lapis underline underline-offset-4">← เส้นทางเรียนรู้ทั้งหมด</Link>
      <header className="mt-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-verdigris/10 text-verdigris"><Icon name={p.icon} size={24} /></span>
        <h1 className="display-h1 mt-4">{p.title}</h1>
        <p className="term-accent mt-1">{p.original}</p>
        <p className="lead-text mt-4">{p.summary}</p>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <div className="flex items-center gap-1.5"><Clock size={15} /><dt className="sr-only">เวลาอ่านรวม</dt><dd>อ่านรวมประมาณ {p.totalMinutes} นาที</dd></div>
          <div className="flex items-center gap-1.5"><ListOrdered size={15} /><dt className="sr-only">จำนวนขั้น</dt><dd>{p.steps.length} ขั้นตามลำดับ</dd></div>
          <div className="flex items-center gap-1.5 text-accent"><Target size={15} /><dt className="sr-only">ระดับ</dt><dd>ระดับ{DIFFICULTY[p.difficulty]}</dd></div>
          <div className="flex items-center gap-1.5"><Users size={15} /><dt className="sr-only">เหมาะกับ</dt><dd>{p.audience}</dd></div>
        </dl>
      </header>

      <section className="mt-8 rounded-2xl border-l-4 border-accent bg-accent/10 p-5" aria-label="สิ่งที่จะได้">
        <p className="text-sm font-bold text-accent">อ่านจบแล้วคุณจะ…</p>
        <ul className="mt-2 space-y-1.5 text-[15px]">{p.outcomes.map((o) => <li key={o} className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{o}</li>)}</ul>
      </section>

      <div className="mt-10"><PathTracker slug={p.slug} steps={p.steps} /></div>

      <section className="mt-14 border-t border-line pt-6">
        <h2 className="text-lg font-bold">เส้นทางอื่น</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">{others.map((o) => (
          <li key={o.slug}><Link href={`/paths/${o.slug}`} className="block h-full rounded-2xl border border-line bg-surface p-4 hover:border-verdigris"><span className="font-semibold">{o.title}</span><span className="mt-1 block text-xs text-muted">{o.steps.length} ขั้น · ~{o.totalMinutes} นาที</span></Link></li>))}
        </ul>
      </section>
    </div>
  );
}
