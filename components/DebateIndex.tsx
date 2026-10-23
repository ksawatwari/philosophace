"use client";
// components/DebateIndex.tsx — ค้นหา/กรองข้อโต้แย้งตามประเภทและหัวข้อ พร้อมไอคอน
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Swords, FlaskRound, Scale, MessageSquareQuote } from "lucide-react";
import type { Debate } from "@/lib/debates";
import { DEBATE_KINDS } from "@/lib/debate-kinds";
import { TOPICS, topicsOf } from "@/lib/taxonomy";
import { Icon } from "./Icon";

const KIND_ICON = { "thought-experiment": FlaskRound, paradox: Swords, dilemma: Scale, debate: MessageSquareQuote } as const;
const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button aria-pressed={on} onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${on ? "border-verdigris bg-verdigris text-paper" : "border-line bg-surface hover:border-verdigris"}`}>{children}</button>
);

export function DebateIndex({ debates }: { debates: Debate[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const hits = useMemo(() => {
    const n = q.trim().toLowerCase();
    return debates.filter((d) => (!kind || d.kind === kind) && (!topic || topicsOf(d.branch).some((t) => t.key === topic)) && (!n || [d.title, d.original_name, d.summary, ...d.branch].join(" ").toLowerCase().includes(n)));
  }, [debates, q, kind, topic]);
  const kinds = Object.keys(DEBATE_KINDS) as (keyof typeof DEBATE_KINDS)[];

  return (
    <div>
      <label className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-soft focus-within:border-verdigris">
        <Search size={20} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อข้อโต้แย้ง สาขา หรือคำอธิบาย" className="w-full bg-transparent outline-none placeholder:text-muted" />
      </label>

      <div className="mt-4 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="กรองตามประเภท">
          <span className="mr-1 text-sm text-muted">ประเภท</span>
          {kinds.map((k) => { const I = KIND_ICON[k]; return <Chip key={k} on={kind === k} onClick={() => setKind((v) => (v === k ? null : k))}><I size={14} /> {DEBATE_KINDS[k]}</Chip>; })}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="กรองตามหัวข้อ">
          <span className="mr-1 text-sm text-muted">หัวข้อ</span>
          {TOPICS.filter((t) => debates.some((d) => topicsOf(d.branch).some((x) => x.key === t.key))).map((t) => (
            <Chip key={t.key} on={topic === t.key} onClick={() => setTopic((v) => (v === t.key ? null : t.key))}><Icon name={t.icon} size={14} /> {t.th}</Chip>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">พบ {hits.length} รายการ</p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {hits.map((d) => { const K = KIND_ICON[d.kind]; return (
          <li key={d.slug}>
            <Link href={`/debates/${d.slug}`} className="group block h-full rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-verdigris">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-accent"><K size={14} /> {DEBATE_KINDS[d.kind]}</p>
              <h2 className="mt-1.5 text-xl font-bold leading-snug group-hover:text-verdigris">{d.title}</h2>
              <p className="text-sm italic text-muted">{d.original_name}</p>
              <p className="mt-3 line-clamp-3 text-[15px]">{d.summary}</p>
              <p className="mt-3 flex flex-wrap gap-1.5 text-xs text-muted">
                {topicsOf(d.branch).map((t) => <span key={t.key} className="inline-flex items-center gap-1 rounded-full bg-sunk px-2 py-0.5"><Icon name={t.icon} size={12} /> {t.th}</span>)}
              </p>
            </Link>
          </li>
        ); })}
      </ul>
      {hits.length === 0 && <p className="mt-10 text-center text-muted">ไม่พบรายการที่ตรงกัน</p>}
    </div>
  );
}
