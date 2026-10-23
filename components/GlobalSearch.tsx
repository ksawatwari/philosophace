"use client";
// components/GlobalSearch.tsx — ค้นหารวม (⌘/Ctrl+K): นักคิด ศัพท์ ข้อโต้แย้ง เส้นทาง + กรองด้วย “คำถามชีวิต / เรื่องที่กังวล”
// โหลดดัชนีจาก /search-index.json แบบ lazy ตอนเปิดครั้งแรก
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, User, BookMarked, MessagesSquare, Route, CornerDownLeft } from "lucide-react";
import { LIFE_QUESTIONS } from "@/lib/lifeQuestions";
import type { SearchItem } from "@/lib/searchIndex";
import { Icon } from "./Icon";

const TYPES = [
  { key: "all", th: "ทั้งหมด" }, { key: "thinker", th: "นักคิด" }, { key: "term", th: "ศัพท์" }, { key: "debate", th: "ข้อโต้แย้ง" }, { key: "path", th: "เส้นทาง" },
] as const;
const TYPE_ICON = { thinker: User, term: BookMarked, debate: MessagesSquare, path: Route } as const;
const TYPE_TH = { thinker: "นักคิด", term: "ศัพท์", debate: "ข้อโต้แย้ง", path: "เส้นทาง" } as const;
const norm = (s: string) => s.toLowerCase();

function scoreItem(it: SearchItem, tokens: string[]) {
  let total = 0;
  for (const q of tokens) {
    let s = 0; const t = norm(it.title);
    if (t === q) s += 10; else if (t.includes(q)) s += 6;
    if (norm(it.sub).includes(q)) s += 3;
    if (it.tags.some((x) => norm(x).includes(q))) s += 2;
    if (norm(it.summary).includes(q)) s += 1.5;
    for (const lq of LIFE_QUESTIONS) if (it.life.includes(lq.key) && (norm(lq.th).includes(q) || norm(lq.blurb).includes(q))) s += 2.5; // พิมพ์ “ความยุติธรรม” → เจอทุกชิ้นที่ติดแท็กนี้
    if (s === 0) return 0; // ทุกคำต้องเจออะไรสักอย่าง (AND)
    total += s;
  }
  return total;
}

export function GlobalSearch({ open, onClose, initialLife }: { open: boolean; onClose: () => void; initialLife: string | null }) {
  const router = useRouter();
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]["key"]>("all");
  const [life, setLife] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setLife(initialLife); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open, initialLife]);
  useEffect(() => {
    if (!open || index || error) return;
    fetch("/search-index.json").then((r) => r.json()).then(setIndex).catch(() => setError(true));
  }, [open, index, error]);

  const results = useMemo(() => {
    if (!index) return [];
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    let pool = index.filter((it) => (type === "all" || it.type === type) && (!life || it.life.includes(life)));
    if (!tokens.length) return life ? pool.slice(0, 40) : [];
    return pool.map((it) => ({ it, s: scoreItem(it, tokens) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 30).map((x) => x.it);
  }, [index, q, type, life]);

  useEffect(() => setActive(0), [q, type, life]);
  const go = (it: SearchItem) => { onClose(); router.push(it.href); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter" && results[active]) go(results[active]);
  };
  useEffect(() => { document.getElementById(`sr-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active]);
  const lq = LIFE_QUESTIONS.find((x) => x.key === life);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-3 pt-[8vh] backdrop-blur-sm" onMouseDown={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label="ค้นหา" onKeyDown={onKey} onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
            className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search size={20} className="text-muted" aria-hidden />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อ แนวคิด หรือปัญหาในใจ เช่น “ความหมายชีวิต”" aria-label="คำค้นหา"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted" />
              <button onClick={onClose} aria-label="ปิดการค้นหา" className="rounded-md p-1.5 text-muted hover:bg-sunk hover:text-ink"><X size={18} /></button>
            </div>

            <div className="space-y-2 border-b border-line bg-sunk px-4 py-3">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="กรองตามคำถามชีวิต">
                <span className="mr-1 self-center text-xs font-semibold text-muted">คำถามชีวิต</span>
                {LIFE_QUESTIONS.map((x) => (
                  <button key={x.key} aria-pressed={life === x.key} onClick={() => setLife((v) => (v === x.key ? null : x.key))}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs transition-colors ${life === x.key ? "border-verdigris bg-verdigris text-paper" : "border-line bg-surface hover:border-verdigris"}`}><Icon name={x.icon} size={12} /> {x.th}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="กรองตามประเภท">
                {TYPES.map((x) => <button key={x.key} aria-pressed={type === x.key} onClick={() => setType(x.key)} className={`rounded-full px-2.5 py-0.5 text-xs ${type === x.key ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>{x.th}</button>)}
              </div>
            </div>

            <div className="min-h-[8rem] overflow-y-auto p-2" role="listbox" aria-label="ผลการค้นหา">
              {error && <p className="p-6 text-center text-sm text-muted">โหลดดัชนีค้นหาไม่สำเร็จ ลองรีเฟรชหน้า</p>}
              {!error && !index && <p className="p-6 text-center text-sm text-muted">กำลังโหลดดัชนี…</p>}
              {index && !q.trim() && !life && (
                <div className="p-3">
                  <p className="text-sm font-semibold text-muted">มีเรื่องอะไรค้างคาใจ? เลือกคำถามชีวิตเพื่อดูนักคิดและข้อโต้แย้งที่เกี่ยวข้อง</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">{LIFE_QUESTIONS.map((x) => (
                    <li key={x.key}><button onClick={() => setLife(x.key)} className="flex h-full w-full gap-3 rounded-xl border border-line p-3 text-left hover:border-verdigris">
                      <span className="mt-0.5 text-verdigris"><Icon name={x.icon} size={18} /></span><span><span className="block font-semibold">{x.th}</span><span className="block text-xs text-muted">{x.blurb}</span></span></button></li>))}</ul>
                </div>
              )}
              {index && lq && !q.trim() && <p className="px-3 pb-1 pt-2 text-xs text-muted">{lq.blurb}</p>}
              {index && (q.trim() || life) && results.length === 0 && <p className="p-6 text-center text-sm text-muted">ไม่พบรายการที่ตรงกัน ลองคำที่กว้างขึ้นหรือล้างตัวกรอง</p>}
              {results.map((it, i) => { const I = TYPE_ICON[it.type]; return (
                <button key={it.type + it.slug} id={`sr-${i}`} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onClick={() => go(it)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ${i === active ? "bg-verdigris/10" : ""}`}>
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sunk text-muted"><I size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><span className="truncate font-semibold">{it.title}</span><span className="shrink-0 rounded-full bg-sunk px-2 py-0.5 text-[0.65rem] text-muted">{TYPE_TH[it.type]}</span></span>
                    <span className="block truncate text-xs text-muted">{it.sub}</span>
                    <span className="mt-0.5 line-clamp-1 text-sm text-ink/80">{it.summary}</span>
                  </span>
                  {i === active && <CornerDownLeft size={14} className="mt-1 shrink-0 text-muted" aria-hidden />}
                </button>); })}
            </div>
            <div className="flex justify-between border-t border-line bg-sunk px-4 py-2 text-xs text-muted"><span>↑↓ เลือก · Enter เปิด · Esc ปิด</span><span>{index ? `${index.length} รายการในดัชนี` : ""}</span></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
