// components/DebateCards.tsx — กริดการ์ดข้อโต้แย้ง/การทดลองทางความคิด (Server Component; ใช้ซ้ำที่หน้านักคิดและหน้าศัพท์)
import Link from "next/link";
import { FlaskRound, Swords, Scale, MessageSquareQuote, ArrowRight } from "lucide-react";
import type { Debate } from "@/lib/debates";
import { DEBATE_KINDS } from "@/lib/debate-kinds";

const KIND_ICON = { "thought-experiment": FlaskRound, paradox: Swords, dilemma: Scale, debate: MessageSquareQuote } as const;

export function DebateCards({ debates, title, note }: { debates: Debate[]; title: string; note?: string }) {
  return (
    <section className="mt-10" aria-label={title}>
      <h2 className="text-lg font-bold">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {debates.map((d) => { const K = KIND_ICON[d.kind]; return (
          <li key={d.slug}>
            <Link href={`/debates/${d.slug}`} className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-accent">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-accent"><K size={14} /> {DEBATE_KINDS[d.kind]}</span>
              <span className="mt-1 font-bold leading-snug group-hover:text-accent">{d.title}</span>
              <span className="mt-1.5 line-clamp-2 text-sm text-muted">{d.summary}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-accent">ลองตัดสินใจ <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          </li>
        ); })}
      </ul>
    </section>
  );
}
