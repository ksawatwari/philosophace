// app/debates/[slug]/page.tsx — หน้าข้อโต้แย้ง: โพลตัดสินใจ → เนื้อหา → จุดยืนของแต่ละฝ่าย → นักคิด/ศัพท์ที่เกี่ยวข้อง
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Clock } from "lucide-react";
import { getAllDebates, getDebate } from "@/lib/debates";
import { DEBATE_KINDS } from "@/lib/debate-kinds";
import { getAllEntries } from "@/lib/content";
import { getAllTerms } from "@/lib/glossary";
import { CATEGORY_ICONS, categoryLabel, topicsOf } from "@/lib/taxonomy";
import { CitePopover, QuoteCard, Trivia, TermPopover } from "@/components/mdx";
import { DebatePoll } from "@/components/DebatePoll";
import { ReadingProgress } from "@/components/ReadingProgress";
import { VisitTracker } from "@/components/VisitTracker";
import { Icon } from "@/components/Icon";

export const dynamicParams = false;
export const generateStaticParams = () => getAllDebates().map((d) => ({ slug: d.slug }));
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = getDebate(params.slug);
  return d ? { title: d.meta.title, description: d.meta.summary } : {};
}

export default function DebatePage({ params }: { params: { slug: string } }) {
  const entry = getDebate(params.slug);
  if (!entry) notFound();
  const { meta, content } = entry;
  const thinkers = getAllEntries();
  const terms = getAllTerms();
  const names = Object.fromEntries(thinkers.map((t) => [t.slug, t.title]));
  const name = (s: string) => names[s] ?? s;
  const minutes = Math.max(1, Math.round(content.replace(/<[^>]+>/g, "").length / 1000));

  const components = {
    Cite: ({ n }: { n: number }) => <CitePopover n={n} text={meta.citations[n - 1]} />,
    Term: ({ name: slug, children }: { name: string; children: React.ReactNode }) => {
      const t = terms.find((x) => x.slug === slug);
      return <TermPopover term={t && { slug: t.slug, term_th: t.term_th, term_original: t.term_original, definition: t.definition }}>{children}</TermPopover>;
    },
    QuoteCard, Trivia,
  };

  return (
    <>
      <ReadingProgress />
      <VisitTracker type="debate" slug={meta.slug} />
      <article className="mx-auto max-w-reading">
        <Link href="/debates" className="text-sm text-lapis underline underline-offset-4">← ข้อโต้แย้งและการทดลองทางความคิด</Link>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-accent/15 px-2.5 py-1 font-bold text-accent">{DEBATE_KINDS[meta.kind]}</span>
          <span className="text-muted">{meta.originator}</span>
          <span className="inline-flex items-center gap-1 text-muted"><Clock size={13} /> อ่าน ~{minutes} นาที</span>
        </div>
        <h1 className="display-h1 mt-3">{meta.title}</h1>
        <p className="term-accent mt-1 text-lg">{meta.original_name}</p>
        <p className="mt-4 flex flex-wrap gap-2 text-xs">
          {topicsOf(meta.branch).map((t) => <span key={t.key} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1"><Icon name={t.icon} size={13} /> {t.th}</span>)}
          {meta.categories.map((c) => <Link key={c} href={`/category/${c}`} className="inline-flex items-center gap-1 rounded-full bg-lapis/10 px-2.5 py-1 text-lapis hover:bg-lapis/20"><Icon name={CATEGORY_ICONS[c]} size={13} /> {categoryLabel(c)}</Link>)}
        </p>
        <p className="lead-text mt-6">{meta.summary}</p>

        {meta.poll && <div className="mt-8"><DebatePoll slug={meta.slug} question={meta.poll.question} options={meta.poll.options} names={names} /></div>}

        <div className="article-body mt-10 max-w-none">
          <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>

        {meta.positions.length > 0 && (
          <section className="mt-12">
            <h2 className="section-h2">จุดยืนของแต่ละฝ่าย</h2>
            <div className="mt-4 space-y-3">
              {meta.positions.map((p) => (
                <details key={p.label} className="group rounded-2xl border border-line bg-surface px-5 py-4 shadow-soft" open>
                  <summary className="cursor-pointer font-semibold marker:text-verdigris">{p.label}</summary>
                  <p className="mt-2 text-[15px] leading-relaxed">{p.claim}</p>
                  {p.holders.length > 0 && <p className="mt-2 text-sm text-muted">นักคิดที่เกี่ยวข้อง: {p.holders.map((h, i) => <span key={h}>{i > 0 && ", "}<Link href={`/philosophy/${h}`} className="text-lapis underline">{name(h)}</Link></span>)}</p>}
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold">นักคิดหลัก</h2>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">{meta.key_figures.map((s) => <li key={s}><Link href={`/philosophy/${s}`} className="rounded-full border border-line bg-surface px-3 py-1 text-lapis hover:border-verdigris">{name(s)}</Link></li>)}</ul>
          </div>
          <div>
            <h2 className="text-lg font-bold">ศัพท์ที่เกี่ยวข้อง</h2>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">{meta.related_terms.map((s) => { const t = terms.find((x) => x.slug === s); return t ? <li key={s}><Link href={`/glossary/${s}`} className="rounded-full border border-line bg-surface px-3 py-1 text-lapis hover:border-verdigris">{t.term_th.split(" (")[0]}</Link></li> : null; })}</ul>
          </div>
        </section>

        {meta.citations.length > 0 && (
          <section className="mt-14 border-t border-line pt-6">
            <h2 className="section-h2">เอกสารอ้างอิง</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] text-muted">{meta.citations.map((c, i) => <li key={i}>{c}</li>)}</ol>
          </section>
        )}
      </article>
    </>
  );
}
