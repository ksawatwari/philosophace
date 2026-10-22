"use client";
// components/GlossaryIndex.tsx — พจนานุกรมค้นหาได้ + กรองตัวอักษร ก-ฮ / A-Z + แท็กสาขา
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { GlossaryEntry } from "@/lib/glossary";
import { THAI_LETTERS, LATIN_LETTERS, thaiInitial, latinInitial } from "@/lib/glossary-utils";

export function GlossaryIndex({ terms }: { terms: GlossaryEntry[] }) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"th" | "en">("th");
  const [letter, setLetter] = useState<string | null>(null);
  const [branches, setBranches] = useState<Set<string>>(new Set());

  const initialOf = (t: GlossaryEntry) => (mode === "th" ? thaiInitial(t.term_th) : latinInitial(t.term_original));
  const allBranches = useMemo(() => [...new Set(terms.flatMap((t) => t.branch))], [terms]);
  const available = useMemo(() => new Set(terms.map(initialOf)), [terms, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hits = terms.filter((t) => {
      if (letter && initialOf(t) !== letter) return false;
      if (branches.size && !t.branch.some((b) => branches.has(b))) return false;
      return !needle || [t.term_th, t.term_original, t.definition, ...t.branch].join(" ").toLowerCase().includes(needle);
    }).sort((a, b) => mode === "th" ? a.term_th.localeCompare(b.term_th, "th") : a.term_original.localeCompare(b.term_original));
    const m = new Map<string, GlossaryEntry[]>();
    hits.forEach((t) => { const k = initialOf(t); m.set(k, [...(m.get(k) ?? []), t]); });
    return [...m.entries()];
  }, [terms, q, letter, branches, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const letters = mode === "th" ? THAI_LETTERS : LATIN_LETTERS;
  const toggleBranch = (b: string) => setBranches((s) => { const n = new Set(s); n.has(b) ? n.delete(b) : n.add(b); return n; });

  return (
    <div>
      <label className="glass flex items-center gap-3 rounded-xl border border-line px-4 py-3">
        <Search size={20} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาศัพท์ คำต้นฉบับ หรือคำอธิบาย" className="w-full bg-transparent outline-none placeholder:text-muted" />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["th", "en"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setLetter(null); }} aria-pressed={mode === m}
            className={`rounded-full border px-3 py-0.5 text-sm ${mode === m ? "border-verdigris bg-verdigris text-paper" : "border-line"}`}>
            {m === "th" ? "ก–ฮ" : "A–Z"}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" />
        {allBranches.map((b) => (
          <button key={b} onClick={() => toggleBranch(b)} aria-pressed={branches.has(b)}
            className={`rounded-full border px-3 py-0.5 text-sm ${branches.has(b) ? "border-lapis bg-lapis text-paper" : "border-line hover:border-lapis"}`}>{b}</button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1" role="group" aria-label="กรองตามตัวอักษร">
        {letters.map((l) => (
          <button key={l} disabled={!available.has(l)} onClick={() => setLetter((c) => (c === l ? null : l))} aria-pressed={letter === l}
            className={`h-8 min-w-8 rounded px-1.5 text-sm ${letter === l ? "bg-verdigris text-paper" : "hover:bg-line/60"} disabled:opacity-25 disabled:hover:bg-transparent`}>{l}</button>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        {grouped.map(([l, items]) => (
          <section key={l} aria-label={`หมวด ${l}`}>
            <h2 className="mb-3 border-b border-line pb-1 font-serif text-2xl font-bold text-verdigris">{l}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {items.map((t) => (
                <li key={t.slug}>
                  <Link href={`/glossary/${t.slug}`} className="block h-full rounded-xl border border-line bg-surface p-4 hover:border-verdigris">
                    <p className="font-serif text-lg font-bold">{t.term_th}</p>
                    <p className="text-sm italic text-muted">{t.term_original} · {t.language}</p>
                    <p className="mt-2 line-clamp-3 text-[15px]">{t.definition}</p>
                    <p className="mt-2 flex flex-wrap gap-1.5 text-xs text-muted">{t.branch.map((b) => <span key={b} className="rounded-full border border-line px-2 py-0.5">{b}</span>)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {grouped.length === 0 && <p className="py-10 text-center text-muted">ไม่พบศัพท์ที่ตรงกัน ลองล้างตัวกรองหรือเปลี่ยนคำค้นหา</p>}
      </div>
    </div>
  );
}
