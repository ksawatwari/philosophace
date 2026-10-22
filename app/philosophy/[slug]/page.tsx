// app/philosophy/[slug]/page.tsx — หน้าบทความนักคิด: หัวเรื่อง → TL;DR + อุปมา → เนื้อหา (max-w ~46rem) + สารบัญเหนียว
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { CalendarDays, Clock, BookOpen, ListTree, Hourglass, Globe } from "lucide-react";
import { getAllEntries, getEntry } from "@/lib/content";
import { getAllTerms } from "@/lib/glossary";
import { getAllDebates, DEBATE_KINDS } from "@/lib/debates";
import { buildGraph } from "@/lib/graph";
import { CATEGORY_ICONS, categoryLabel } from "@/lib/taxonomy";
import { CitePopover, QuoteCard, Trivia, TermPopover } from "@/components/mdx";
import { MiniGraph } from "@/components/MiniGraph";
import { TldrCard } from "@/components/TldrCard";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TocSidebar } from "@/components/TocSidebar";
import { Icon } from "@/components/Icon";

export const dynamicParams = false;
export const generateStaticParams = () => getAllEntries().map((e) => ({ slug: e.slug }));
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const e = getEntry(params.slug);
  return e ? { title: e.meta.title, description: e.meta.summary } : {};
}

const slugify = (s: string) => s.trim().replace(/\s+/g, "-");
const headings = (md: string) => [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const entry = getEntry(params.slug);
  if (!entry) notFound();
  const { meta, content } = entry;
  const all = getAllEntries();
  const terms = getAllTerms();
  const debates = getAllDebates();
  const graph = buildGraph(all, debates);
  const nameOf = (s: string) => all.find((e) => e.slug === s)?.title ?? s;
  const exists = (s: string) => all.some((e) => e.slug === s);
  const toc = headings(content).map((h) => ({ id: slugify(h), text: h }));
  const minutes = Math.max(1, Math.round(content.replace(/<[^>]+>/g, "").length / 1000)); // ภาษาไทย ≈ 1,000 อักขระ/นาที

  // TL;DR 3 ข้อ: ถ้าไม่ได้เขียนเอง สร้างจาก summary + แนวคิดสำคัญ + ความเชื่อมโยง
  const links = [meta.influenced_by.length ? `รับอิทธิพลจาก ${meta.influenced_by.slice(0, 3).map(nameOf).join(", ")}` : "", meta.influences.length ? `ส่งอิทธิพลต่อ ${meta.influences.slice(0, 3).map(nameOf).join(", ")}` : ""].filter(Boolean).join(" · ");
  const bullets = meta.tldr ?? [
    meta.summary,
    `แนวคิดแกนกลาง: ${meta.key_concepts.slice(0, 3).join(" · ")}`,
    `${meta.era} · สายธาร${meta.tradition}${links ? " — " + links : ""}`,
  ];

  const components = {
    Cite: ({ n }: { n: number }) => <CitePopover n={n} text={meta.citations[n - 1]} />,
    Term: ({ name, children }: { name: string; children: React.ReactNode }) => {
      const t = terms.find((x) => x.slug === name);
      return <TermPopover term={t && { slug: t.slug, term_th: t.term_th, term_original: t.term_original, definition: t.definition }}>{children}</TermPopover>;
    },
    QuoteCard, Trivia,
    h2: (p: React.ComponentProps<"h2">) => <h2 id={slugify(String(p.children))} {...p} />,
  };
  const relatedTerms = terms.filter((t) => t.related_thinkers.includes(meta.slug)).map((t) => ({ slug: t.slug, term_th: t.term_th }));
  const debatesOf = debates.filter((d) => d.key_figures.includes(meta.slug));
  const link = (s: string, i: number) => <span key={s}>{i > 0 && ", "}{exists(s) ? <Link className="text-lapis underline underline-offset-2" href={`/philosophy/${s}`}>{nameOf(s)}</Link> : nameOf(s)}</span>;

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,46rem)_14rem] lg:justify-center lg:gap-14">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 font-semibold text-accent"><Hourglass size={13} /> {meta.era}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-verdigris/10 px-2.5 py-1 font-semibold text-verdigris"><Globe size={13} /> {meta.tradition}</span>
              {meta.categories.map((c) => <Link key={c} href={`/category/${c}`} className="inline-flex items-center gap-1 rounded-full bg-lapis/10 px-2.5 py-1 text-lapis hover:bg-lapis/20"><Icon name={CATEGORY_ICONS[c]} size={13} /> {categoryLabel(c)}</Link>)}
            </div>
            <h1 className="display-h1 mt-4">{meta.title}</h1>
            <p className="term-accent mt-1 text-lg">{meta.original_name}</p>
            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5"><Clock size={15} /> อ่านประมาณ {minutes} นาที</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} /> {meta.birth_death}</span>
              <span className="inline-flex items-center gap-1.5"><BookOpen size={15} /> {meta.branch.join(" · ")}</span>
            </p>
          </header>

          <div className="mt-8"><TldrCard bullets={bullets} analogy={meta.analogy} /></div>

          <ul className="mb-8 flex flex-wrap gap-2">{meta.key_concepts.map((k) => <li key={k} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">{k}</li>)}</ul>

          {toc.length > 0 && (
            <details className="mb-8 rounded-xl border border-line bg-surface px-4 py-2.5 lg:hidden">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><ListTree size={16} /> สารบัญ</summary>
              <ul className="mt-2 space-y-1 pb-1 text-[15px]">{toc.map((h) => <li key={h.id}><a className="text-lapis hover:underline" href={`#${h.id}`}>{h.text}</a></li>)}</ul>
            </details>
          )}

          <div className="article-body max-w-none">
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>

          {(meta.influenced_by.length > 0 || meta.influences.length > 0) && (
            <p className="mt-10 rounded-xl bg-sunk p-4 text-sm leading-relaxed text-muted">
              {meta.influenced_by.length > 0 && <span className="block">รับอิทธิพลจาก: {meta.influenced_by.map(link)}</span>}
              {meta.influences.length > 0 && <span className="block">ส่งอิทธิพลต่อ: {meta.influences.map(link)}</span>}
            </p>
          )}

          <MiniGraph centerId={meta.slug} data={graph} terms={relatedTerms} />

          {debatesOf.length > 0 && (
            <section className="mt-8" aria-label="ข้อโต้แย้งที่เกี่ยวข้อง">
              <h2 className="text-lg font-bold">ข้อโต้แย้งและการทดลองทางความคิดที่เกี่ยวข้อง</h2>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm">{debatesOf.map((d) => <li key={d.slug}><Link href={`/debates/${d.slug}`} className="rounded-full border border-accent/40 bg-accent/5 px-3 py-1 text-accent hover:bg-accent/15">{d.title} <span className="opacity-70">· {DEBATE_KINDS[d.kind]}</span></Link></li>)}</ul>
            </section>
          )}

          {meta.citations.length > 0 && (
            <section className="mt-14 border-t border-line pt-6">
              <h2 className="section-h2">เอกสารอ้างอิง</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] text-muted">{meta.citations.map((c, i) => <li key={i} id={`ref-${i + 1}`}>{c}</li>)}</ol>
            </section>
          )}
        </article>

        {toc.length > 0 && <aside className="hidden lg:block"><TocSidebar items={toc} /></aside>}
      </div>
    </>
  );
}
