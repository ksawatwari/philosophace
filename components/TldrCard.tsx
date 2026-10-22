// components/TldrCard.tsx — การ์ด “สรุปย่อ (TL;DR) + อุปมาในชีวิตปัจจุบัน” บนหัวบทความ
import { Zap } from "lucide-react";

export function TldrCard({ bullets, analogy }: { bullets: string[]; analogy?: string }) {
  return (
    <section aria-label="สรุปย่อ" className="mb-8 rounded-r-xl border-l-4 border-accent bg-accent/10 p-5">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent"><Zap size={16} aria-hidden /> สรุปย่อ · TL;DR</p>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed">
        {bullets.slice(0, 3).map((b, i) => (
          <li key={i} className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /><span>{b}</span></li>
        ))}
      </ul>
      {analogy && (
        <div className="mt-4 rounded-xl border border-accent/25 bg-surface/70 p-3.5">
          <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">💡 อุปมาในชีวิตปัจจุบัน</span>
          <p className="mt-2 text-[15px] leading-relaxed">{analogy}</p>
        </div>
      )}
    </section>
  );
}
