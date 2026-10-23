  // app/glossary/[slug]/page.tsx — หน้าศัพท์: นิยาม บริบท นักคิดที่เกี่ยวข้อง + แบ็กลิงก์ไปยังข้อโต้แย้งที่อ้างถึงศัพท์นี้อัตโนมัติ
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTerms, getTerm } from "@/lib/glossary";
import { getAllEntries } from "@/lib/content";
import { getDebatesUsingTerm } from "@/lib/debates";
import { DebateCards } from "@/components/DebateCards";
import { VisitTracker } from "@/components/VisitTracker";

export const dynamicParams = false;
export const generateStaticParams = () => getAllTerms().map((t) => ({ slug: t.slug }));
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = getTerm(params.slug);
  return t ? { title: `${t.term_th} (${t.term_original})`, description: t.definition } : {};
}

export default function TermPage({ params }: { params: { slug: string } }) {
  const t = getTerm(params.slug);
  if (!t) notFound();
  const thinkers = getAllEntries();
  const debates = getDebatesUsingTerm(t.slug);
  return (
    <article className="mx-auto max-w-reading">
      <VisitTracker type="term" slug={t.slug} />
      <Link href="/glossary" className="text-sm text-lapis underline underline-offset-4">← พจนานุกรมศัพท์</Link>
      <h1 className="display-h1 mt-3">{t.term_th}</h1>
      <p className="term-accent mt-1 text-lg">{t.term_original} · {t.language}</p>
      <p className="mt-3 flex flex-wrap gap-2 text-sm">{t.branch.map((b) => <span key={b} className="rounded-full border border-line bg-surface px-3 py-0.5">{b}</span>)}</p>

      <section className="mt-8 rounded-r-xl border-l-4 border-verdigris bg-verdigris/10 p-5"><h2 className="text-sm font-bold text-verdigris">นิยามสั้น</h2><p className="lead-text mt-1">{t.definition}</p></section>
      <h2 className="section-h2 mt-10">บริบททางประวัติศาสตร์</h2>
      <p className="mt-2 text-[1.05rem] leading-[1.8]">{t.historical_context}</p>

      {t.related_thinkers.length > 0 && (
        <>
          <h2 className="section-h2 mt-10">นักคิดที่เกี่ยวข้อง</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {t.related_thinkers.map((s) => { const e = thinkers.find((x) => x.slug === s); return <li key={s}>{e ? <Link href={`/philosophy/${s}`} className="rounded-full border border-line bg-surface px-3 py-1 text-lapis hover:border-verdigris">{e.title}</Link> : <span className="text-muted">{s}</span>}</li>; })}
          </ul>
        </>
      )}

      {debates.length > 0
        ? <DebateCards debates={debates} title="ข้อโต้แย้งและการทดลองทางความคิดที่อ้างถึงศัพท์นี้" note={`พบ ${debates.length} เรื่อง — ดูว่าแนวคิดนี้ถูกนำไปใช้ถกเถียงอย่างไร`} />
        : <p className="mt-10 rounded-xl bg-sunk p-4 text-sm text-muted">ยังไม่มีข้อโต้แย้งในคลังที่อ้างถึงศัพท์นี้โดยตรง ลองดู <Link href="/debates" className="text-lapis underline">ข้อโต้แย้งทั้งหมด</Link></p>}

      {t.citations.length > 0 && (
        <section className="mt-12 border-t border-line pt-6"><h2 className="section-h2">เอกสารอ้างอิง</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] text-muted">{t.citations.map((c, i) => <li key={i}>{c}</li>)}</ol></section>
      )}
    </article>
  );
}
