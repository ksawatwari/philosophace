// app/category/[slug]/page.tsx — รายการนักคิดและศัพท์ในหมวดหมู่หนึ่ง
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, getCategory } from "@/lib/taxonomy";
import { getAllEntries } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ slug: c.slug }));
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCategory(params.slug);
  return c ? { title: c.th, description: c.desc } : {};
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = getCategory(params.slug);
  if (!cat) notFound();
  const entries = getAllEntries().filter((e) => (e.categories as string[]).includes(cat.slug));
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-muted">หมวดหมู่ · {cat.en}</p>
      <h1 className="mt-1 font-serif text-4xl font-bold">{cat.th}</h1>
      <p className="mt-2 max-w-prose text-muted">{cat.desc}</p>
      <p className="mt-6 text-sm text-muted">{entries.length} บทความ</p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link href={`/philosophy/${e.slug}`} className="block h-full rounded-xl border border-line bg-surface p-5 hover:border-verdigris">
              <p className="text-xs text-muted">{e.era} · {e.tradition}</p>
              <h2 className="mt-1 text-xl font-bold">{e.title}</h2>
              <p className="text-sm text-muted">{e.original_name}</p>
              <p className="mt-3 text-[15px]">{e.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
      {entries.length === 0 && <p className="mt-10 text-center text-muted">ยังไม่มีบทความในหมวดนี้</p>}
    </div>
  );
}
