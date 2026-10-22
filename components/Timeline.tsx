"use client";
// components/Timeline.tsx — ไทม์ไลน์แนวนอน (เลื่อนซ้ายขวา) และแนวตั้ง สลับได้
import Link from "next/link";
import { useState } from "react";
import { ArrowLeftRight, ArrowUpDown } from "lucide-react";

export type TimelineItem = { slug: string; title: string; era: string; year: number };

// แปลงปี ค.ศ. เป็นข้อความไทย พร้อม พ.ศ. (พ.ศ. = ค.ศ. + 543) ; ปีติดลบ = ก่อน ค.ศ.
const fmt = (y: number) => (y < 0 ? `${-y} ปีก่อน ค.ศ.` : `ค.ศ. ${y} / พ.ศ. ${y + 543}`);

export function Timeline({ items }: { items: TimelineItem[] }) {
  const [horizontal, setHorizontal] = useState(true);
  const sorted = [...items].sort((a, b) => a.year - b.year);

  return (
    <section id="timeline" aria-label="ไทม์ไลน์ปรัชญา">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">ไทม์ไลน์ความคิด</h2>
        <button onClick={() => setHorizontal((v) => !v)} className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm hover:bg-line/50">
          {horizontal ? <ArrowUpDown size={16} /> : <ArrowLeftRight size={16} />}
          {horizontal ? "แนวตั้ง" : "แนวนอน"}
        </button>
      </div>

      <ol className={horizontal
        ? "relative flex gap-6 overflow-x-auto pb-4 pt-6 before:absolute before:left-0 before:right-0 before:top-[1.1rem] before:h-px before:bg-line"
        : "relative ml-3 space-y-6 border-l border-line pl-6"}>
        {sorted.map((it) => (
          <li key={it.slug} className={horizontal ? "relative w-52 shrink-0 pt-5" : "relative"}>
            <span className={`absolute h-3 w-3 rounded-full bg-verdigris ring-4 ring-paper ${horizontal ? "left-0 top-[-0.35rem]" : "-left-[2.1rem] top-2"}`} />
            <p className="text-xs text-muted">{fmt(it.year)}</p>
            <Link href={`/philosophy/${it.slug}`} className="font-serif font-bold hover:text-verdigris">{it.title}</Link>
            <p className="text-sm text-muted">{it.era}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
