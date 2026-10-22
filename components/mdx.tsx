"use client";
// components/mdx.tsx — คอมโพเนนต์ภายใน MDX: เชิงอรรถ, ศัพท์ (Term), การ์ดคำคม, เกร็ดน่ารู้
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, Lightbulb, Copy, Check, ArrowRight } from "lucide-react";

/** ตัวช่วยเปิด/ปิด popover แบบหน่วงเวลา (hover ไม่กะพริบ) + รองรับคีย์บอร์ดและการแตะ */
function useHoverPopover(openDelay = 120, closeDelay = 220) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (t.current) clearTimeout(t.current); };
  useEffect(() => clear, []);
  return {
    open,
    show: () => { clear(); t.current = setTimeout(() => setOpen(true), openDelay); },
    hide: () => { clear(); t.current = setTimeout(() => setOpen(false), closeDelay); },
    toggle: () => { clear(); setOpen((v) => !v); },
    close: () => { clear(); setOpen(false); },
  };
}

/** กล่อง popover แบบกระจก (glassmorphism): มือถือเป็น bottom sheet, เดสก์ท็อปลอยเหนือข้อความ */
function GlassPop({ children }: { children: React.ReactNode }) {
  return (
    <span className="fixed inset-x-3 bottom-3 z-50 block sm:absolute sm:inset-x-auto sm:bottom-full sm:left-1/2 sm:z-30 sm:w-80 sm:-translate-x-1/2 sm:pb-2">
      <motion.span
        initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="glass block rounded-2xl border border-line/70 p-4 text-left text-sm font-normal leading-relaxed text-ink shadow-xl ring-1 ring-black/5"
      >
        {children}
      </motion.span>
    </span>
  );
}

/** <Cite n={1} /> — เชิงอรรถแบบ popover */
export function CitePopover({ n, text }: { n: number; text?: string }) {
  const p = useHoverPopover();
  return (
    <span className="relative inline-block" onMouseEnter={p.show} onMouseLeave={p.hide}>
      <button type="button" aria-label={`เชิงอรรถ ${n}`} aria-expanded={p.open} onClick={p.toggle} onFocus={p.show} onBlur={p.hide}
        className="mx-0.5 rounded-md bg-lapis/10 px-1 align-super text-[0.7rem] font-semibold text-lapis transition-colors hover:bg-lapis/20">{n}</button>
      <AnimatePresence>{p.open && <GlassPop><span className="block text-xs font-semibold uppercase tracking-wide text-lapis">อ้างอิง [{n}]</span><span className="mt-1 block">{text ?? "ไม่พบแหล่งอ้างอิง"}</span></GlassPop>}</AnimatePresence>
    </span>
  );
}

/** <QuoteCard author source>…</QuoteCard> */
export function QuoteCard({ author, source, children }: { author: string; source?: string; children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLQuoteElement>(null);
  const copy = async () => {
    const text = `${ref.current?.innerText ?? ""}\n— ${author}${source ? `, ${source}` : ""}`;
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {}
  };
  return (
    <figure className="not-prose relative my-10 overflow-hidden rounded-2xl border border-line bg-surface p-6 pl-8 shadow-soft">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-verdigris to-lapis" />
      <Quote size={22} className="text-verdigris" />
      <blockquote ref={ref} className="mt-2 text-xl font-medium leading-relaxed">{children}</blockquote>
      <figcaption className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>{author}{source && <> · <cite className="not-italic">{source}</cite></>}</span>
        <button onClick={copy} aria-label="คัดลอกคำคม" className="rounded-md p-1.5 transition-colors hover:bg-sunk hover:text-ink">{done ? <Check size={16} /> : <Copy size={16} />}</button>
      </figcaption>
    </figure>
  );
}

/** <Trivia title>…</Trivia> */
export function Trivia({ title = "เกร็ดน่ารู้", children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="not-prose my-10 rounded-2xl border border-accent/30 bg-accent/5 p-5">
      <p className="flex items-center gap-2 font-semibold text-accent"><Lightbulb size={18} /> {title}</p>
      <div className="mt-2 text-[15px] leading-relaxed">{children}</div>
    </aside>
  );
}

/** <Term name="dasein">ดาไซน์</Term> — ศัพท์เชื่อมพจนานุกรม พร้อมป๊อปอัปกระจก */
export type TermData = { slug: string; term_th: string; term_original: string; definition: string };
export function TermPopover({ term, children }: { term?: TermData; children: React.ReactNode }) {
  const p = useHoverPopover();
  if (!term) return <span>{children}</span>; // ไม่พบศัพท์ → แสดงข้อความปกติ ไม่ให้หน้าพัง
  return (
    <span className="relative inline-block" onMouseEnter={p.show} onMouseLeave={p.hide}>
      <button type="button" aria-expanded={p.open} onClick={p.toggle} onFocus={p.show} onBlur={(e) => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) p.hide(); }}
        className="cursor-help rounded-sm border-b-2 border-dotted border-verdigris/70 bg-verdigris/5 px-0.5 text-inherit transition-colors hover:bg-verdigris/15">{children}</button>
      <AnimatePresence>
        {p.open && (
          <GlassPop>
            <span className="flex items-baseline justify-between gap-2">
              <strong className="text-[0.95rem]">{term.term_th}</strong>
              <em className="term-accent text-xs">{term.term_original}</em>
            </span>
            <span className="mt-1.5 block text-[0.85rem] text-ink/90">{term.definition}</span>
            <Link href={`/glossary/${term.slug}`} onClick={p.close} className="mt-3 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-verdigris hover:underline">
              อ่านนิยามเต็ม <ArrowRight size={14} />
            </Link>
          </GlassPop>
        )}
      </AnimatePresence>
    </span>
  );
}
