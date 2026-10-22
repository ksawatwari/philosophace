// app/glossary/[slug]/page.tsx — หน้ารายละเอียดของศัพท์หนึ่งคำ
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTerms, getTerm } from "@/lib/glossary";
import { getAllEntries } from "@/lib/content";

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
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/glossary" className="text-sm text-lapis underline">พจนานุกรมศัพท์</Link>
      <h1 className="mt-2 font-serif text-4xl font-bold">{t.term_th}</h1>
      <p className="text-lg italic text-muted">{t.term_original} · {t.language}</p>
      <p className="mt-3 flex flex-wrap gap-2 text-sm">{t.branch.map((b) => <span key={b} className="rounded-full border border-line px-3 py-0.5">{b}</span>)}</p>

      <h2 className="mt-8 font-serif text-2xl font-bold">นิยาม</h2>
      <p className="mt-2">{t.definition}</p>
      <h2 className="mt-8 font-serif text-2xl font-bold">บริบททางประวัติศาสตร์</h2>
      <p className="mt-2">{t.historical_context}</p>

      {t.related_thinkers.length > 0 && (
        <>
          <h2 className="mt-8 font-serif text-2xl font-bold">นักคิดที่เกี่ยวข้อง</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {t.related_thinkers.map((s) => {
              const e = thinkers.find((x) => x.slug === s);
              return <li key={s}>{e ? <Link href={`/philosophy/${s}`} className="rounded-full border border-line px-3 py-1 text-lapis hover:border-verdigris">{e.title}</Link> : <span className="text-muted">{s}</span>}</li>;
            })}
          </ul>
        </>
      )}
      {t.citations.length > 0 && (
        <>
          <h2 className="mt-8 font-serif text-2xl font-bold">เอกสารอ้างอิง</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-6 text-[15px] text-muted">{t.citations.map((c, i) => <li key={i}>{c}</li>)}</ol>
        </>
      )}
    </article>
  );
}
