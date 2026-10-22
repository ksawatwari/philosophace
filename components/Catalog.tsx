"use client";
// components/Catalog.tsx — ค้นหาฝั่งไคลเอนต์ + กรองหลายแท็ก (ยุค / สายธารความคิด / สาขา)
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Entry } from "@/lib/content";
import { CATEGORIES, categoryLabel } from "@/lib/taxonomy";

type Facet = "category" | "era" | "tradition" | "branch";
const FACET_LABEL: Record<Facet, string> = { category: "หมวด", era: "ยุค", tradition: "สายธารความคิด", branch: "สาขา" };

export function Catalog({ entries }: { entries: Entry[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Record<Facet, Set<string>>>({ category: new Set(), era: new Set(), tradition: new Set(), branch: new Set() });

  const facets = useMemo(() => ({
    category: CATEGORIES.filter((c) => entries.some((e) => e.categories.includes(c.slug))).map((c) => c.slug) as string[],
    era: [...new Set(entries.map((e) => e.era))],
    tradition: [...new Set(entries.map((e) => e.tradition))],
    branch: [...new Set(entries.flatMap((e) => e.branch))],
  }), [entries]);

  const toggle = (f: Facet, v: string) =>
    setActive((s) => { const n = new Set(s[f]); n.has(v) ? n.delete(v) : n.add(v); return { ...s, [f]: n }; });

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      // ภายในกลุ่มเดียวกัน = OR, ข้ามกลุ่ม = AND
      if (active.category.size && !e.categories.some((c) => active.category.has(c))) return false;
      if (active.era.size && !active.era.has(e.era)) return false;
      if (active.tradition.size && !active.tradition.has(e.tradition)) return false;
      if (active.branch.size && !e.branch.some((b) => active.branch.has(b))) return false;
      if (!needle) return true;
      return [e.title, e.original_name, e.era, e.tradition, ...e.branch, ...e.key_concepts].join(" ").toLowerCase().includes(needle);
    });
  }, [entries, q, active]);

  return (
    <div>
      <label className="glass flex items-center gap-3 rounded-xl border border-line px-4 py-3">
        <Search size={20} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อนักปรัชญา ยุค สาขา หรือแนวคิดสำคัญ"
          className="w-full bg-transparent outline-none placeholder:text-muted" />
      </label>

      <div className="mt-5 space-y-3">
        {(Object.keys(facets) as Facet[]).map((f) => (
          <div key={f} className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted">{FACET_LABEL[f]}</span>
            {facets[f].map((v) => (
              <button key={v} onClick={() => toggle(f, v)} aria-pressed={active[f].has(v)}
                className={`rounded-full border px-3 py-0.5 text-sm transition-colors ${active[f].has(v) ? "border-verdigris bg-verdigris text-paper" : "border-line hover:border-verdigris"}`}>
                {f === "category" ? categoryLabel(v) : v}
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted">พบ {results.length} รายการ</p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((e) => (
          <li key={e.slug}>
            <Link href={`/philosophy/${e.slug}`} className="group block h-full rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-verdigris">
              <p className="text-xs text-muted">{e.era} · {e.tradition}</p>
              <h3 className="mt-1 text-xl font-bold leading-snug group-hover:text-verdigris">{e.title}</h3>
              <p className="text-sm text-muted">{e.original_name}</p>
              <p className="mt-3 line-clamp-3 text-[15px]">{e.summary}</p>
              {e.analogy && <p className="mt-3 line-clamp-2 rounded-lg bg-accent/10 px-3 py-2 text-[13px] leading-relaxed text-ink/80">💡 {e.analogy}</p>}
            </Link>
          </li>
        ))}
      </ul>
      {results.length === 0 && <p className="mt-10 text-center text-muted">ไม่พบรายการที่ตรงกัน ลองลดตัวกรองหรือเปลี่ยนคำค้นหา</p>}
    </div>
  );
}
