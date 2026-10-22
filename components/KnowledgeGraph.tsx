"use client";
// components/KnowledgeGraph.tsx — กราฟความรู้แบบ force-directed (d3-force คำนวณ, React วาด SVG)
// ✔ แถบควบคุมลอย: กรอง นักคิด/ข้อโต้แย้ง · ซูมเข้า/ออก/รีเซ็ต · ค้นหาในกราฟ (ไฮไลต์ + โฟกัส)
// ✔ นักคิด = วงกลมสีตามสายธาร · ข้อโต้แย้ง = ข้าวหลามตัดเรืองแสง · hover แสดงการ์ดพร้อมปุ่มอ่านบทความ
// ✔ ลากโหนดได้ · ลากพื้นหลังเพื่อเลื่อน · คลิก/Enter เพื่อดูรายละเอียดด้านล่าง
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum, type Simulation } from "d3-force";
import { Search, ZoomIn, ZoomOut, RotateCcw, ArrowRight } from "lucide-react";
import type { GraphData, GraphNode } from "@/lib/graph";
import { CATEGORIES } from "@/lib/taxonomy";

type N = GraphNode & SimulationNodeDatum;
type L = { source: string | N; target: string | N; kind?: string };
type TermRef = { slug: string; term_th: string; related_thinkers: string[] };
type TF = { k: number; x: number; y: number };

const W = 1200, H = 1000, PAD = 40;
const PALETTE = ["#047857", "#4F5BD5", "#b7791f", "#b4536a", "#6b7f3a", "#7a5ea8", "#2f8ab0", "#a0522d", "#4a7fb0", "#9a4f96", "#c28b2b"];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function Toggle({ on, set, color, label, diamond }: { on: boolean; set: (v: boolean) => void; color: string; label: string; diamond?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-sm hover:bg-sunk">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="h-4 w-4 accent-[var(--verdigris)]" />
      <span aria-hidden className={`inline-block h-3 w-3 ${diamond ? "rotate-45 rounded-[2px] shadow-[0_0_8px_var(--accent)]" : "rounded-full"}`} style={{ background: color }} /> {label}
    </label>
  );
}
function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-verdigris hover:text-verdigris">{children}</button>
  );
}

export function KnowledgeGraph({ data, terms = [] }: { data: GraphData; terms?: TermRef[] }) {
  const [, force] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const [showThinkers, setShowThinkers] = useState(true);
  const [showDebates, setShowDebates] = useState(true);
  const [query, setQuery] = useState("");
  const [tf, setTf] = useState<TF>({ k: 1, x: 0, y: 0 });
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Simulation<N, undefined> | null>(null);
  const drag = useRef<{ id: string; moved: boolean } | null>(null);
  const pan = useRef<{ sx: number; sy: number; tx: number; ty: number; moved: boolean } | null>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nodes = useMemo<N[]>(() => data.nodes.map((n) => ({ ...n })), [data]);
  const links = useMemo<L[]>(() => data.links.map((l) => ({ ...l })), [data]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // สีตามสายธาร (เฉพาะนักคิด); ข้อโต้แย้งใช้สีอำพัน
  const traditions = useMemo(() => [...new Set(data.nodes.filter((n) => n.kind === "thinker").map((n) => n.tradition))], [data]);
  const colorOf = (n: GraphNode) => (n.kind === "debate" ? "var(--accent)" : n.ghost ? "var(--muted)" : PALETTE[traditions.indexOf(n.tradition) % PALETTE.length]);
  const visible = (n: GraphNode) => (n.kind === "debate" ? showDebates : showThinkers);

  useEffect(() => {
    const keepInside = () => nodes.forEach((n) => { n.x = clamp(n.x ?? W / 2, PAD, W - PAD); n.y = clamp(n.y ?? H / 2, PAD, H - PAD); });
    const sim = forceSimulation<N>(nodes)
      .force("link", forceLink<N, L>(links).id((d) => d.id).distance((l) => (l.kind === "debate" ? 110 : 85)).strength(0.45))
      .force("charge", forceManyBody().strength(-520))
      .force("center", forceCenter(W / 2, H / 2))
      .force("collide", forceCollide(30))
      .stop();
    sim.tick(300); keepInside(); force((v) => v + 1); // คำนวณล่วงหน้า → ไม่มีอนิเมชันตอนโหลด
    sim.on("tick", () => { keepInside(); force((v) => v + 1); });
    simRef.current = sim;
    return () => { sim.stop(); };
  }, [nodes, links]);

  // ---- พิกัด: หน้าจอ → ระบบพิกัด SVG → พิกัดโลก (ก่อนซูม/เลื่อน)
  const toSvg = (e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current!; const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };
  const toWorld = (e: { clientX: number; clientY: number }) => { const p = toSvg(e); return { x: (p.x - tf.x) / tf.k, y: (p.y - tf.y) / tf.k }; };

  const zoomBy = (f: number) => setTf((t) => {
    const k = clamp(t.k * f, 0.5, 4), cx = W / 2, cy = H / 2;
    return { k, x: cx - (cx - t.x) * (k / t.k), y: cy - (cy - t.y) * (k / t.k) };
  });
  const reset = () => setTf({ k: 1, x: 0, y: 0 });
  const focusOn = (n: N) => { const k = 2; setTf({ k, x: W / 2 - (n.x ?? 0) * k, y: H / 2 - (n.y ?? 0) * k }); setSelected(n.id); };

  // ---- ค้นหา
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => (q ? new Set(nodes.filter((n) => visible(n) && (n.label.toLowerCase().includes(q) || n.id.includes(q))).map((n) => n.id)) : new Set<string>()), [q, nodes, showThinkers, showDebates]); // eslint-disable-line react-hooks/exhaustive-deps
  const onSearchKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") { const first = [...matches][0]; const n = first ? byId.get(first) : null; if (n) focusOn(n); } };

  // ---- ลากโหนด / เลื่อนพื้นหลัง
  const onNodeDown = (e: React.PointerEvent, n: N) => {
    e.stopPropagation(); (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { id: n.id, moved: false }; n.fx = n.x; n.fy = n.y; simRef.current?.alphaTarget(0.25).restart(); setHover(null);
  };
  const onNodeMove = (e: React.PointerEvent, n: N) => { if (!drag.current) return; drag.current.moved = true; const p = toWorld(e); n.fx = clamp(p.x, PAD, W - PAD); n.fy = clamp(p.y, PAD, H - PAD); };
  const onNodeUp = (n: N) => { n.fx = null; n.fy = null; simRef.current?.alphaTarget(0); if (drag.current && !drag.current.moved) setSelected((s) => (s === n.id ? null : n.id)); drag.current = null; };
  const onBgDown = (e: React.PointerEvent) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); const p = toSvg(e); pan.current = { sx: p.x, sy: p.y, tx: tf.x, ty: tf.y, moved: false }; };
  const onBgMove = (e: React.PointerEvent) => { if (!pan.current) return; const p = toSvg(e); pan.current.moved = true; setTf((t) => ({ ...t, x: pan.current!.tx + (p.x - pan.current!.sx), y: pan.current!.ty + (p.y - pan.current!.sy) })); };
  const onBgUp = () => { if (pan.current && !pan.current.moved) setSelected(null); pan.current = null; };

  // ---- hover tooltip (หน่วงปิดเล็กน้อยเพื่อให้เมาส์เลื่อนไปกดปุ่มในการ์ดได้)
  const showTip = (n: N) => {
    if (hideT.current) clearTimeout(hideT.current);
    const svg = svgRef.current, wrap = wrapRef.current; if (!svg || !wrap) return;
    const m = svg.getScreenCTM()!; const r = wrap.getBoundingClientRect();
    const sx = (n.x ?? 0) * tf.k + tf.x, sy = (n.y ?? 0) * tf.k + tf.y;
    setHover({ id: n.id, x: sx * m.a + m.e - r.left, y: sy * m.d + m.f - r.top });
  };
  const hideTip = () => { if (hideT.current) clearTimeout(hideT.current); hideT.current = setTimeout(() => setHover(null), 180); };
  const keepTip = () => { if (hideT.current) clearTimeout(hideT.current); };

  const neighbors = useMemo(() => {
    const s = new Set<string>(); if (!selected) return s;
    data.links.forEach((l) => { if (l.source === selected) s.add(l.target); if (l.target === selected) s.add(l.source); });
    return s;
  }, [selected, data]);

  const sel = selected ? data.nodes.find((n) => n.id === selected) : null;
  const hov = hover ? byId.get(hover.id) : null;
  const names = (ids: string[]) => ids.map((i) => data.nodes.find((n) => n.id === i)?.label ?? i).join(", ") || "—";
  const from = selected ? data.links.filter((l) => l.target === selected && l.kind !== "debate").map((l) => l.source) : [];
  const to = selected ? data.links.filter((l) => l.source === selected && l.kind !== "debate").map((l) => l.target) : [];
  const related = selected ? data.links.filter((l) => l.kind === "debate" && (l.source === selected || l.target === selected)).map((l) => (l.source === selected ? l.target : l.source)) : [];
  const legend = traditions.map((t) => ({ t, c: PALETTE[traditions.indexOf(t) % PALETTE.length] }));
  const wrapW = wrapRef.current?.clientWidth ?? 800;


  return (
    <section id="graph" aria-label="กราฟความสัมพันธ์ทางความคิด">
      <h2 className="section-h2">กราฟความสัมพันธ์ทางความคิด</h2>
      <p className="mt-1 text-sm text-muted">ลูกศรชี้จากผู้ให้อิทธิพลไปยังผู้รับอิทธิพล · เส้นประคือความเกี่ยวข้องกับข้อโต้แย้ง · ลากโหนด/พื้นหลัง · เอาเมาส์ชี้เพื่อดูสรุปและปุ่มอ่าน</p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="กรองกราฟตามหมวดหมู่">
        {CATEGORIES.map((c) => (
          <button key={c.slug} aria-pressed={cat === c.slug} onClick={() => setCat((v) => (v === c.slug ? null : c.slug))}
            className={`rounded-full border px-3 py-0.5 text-sm transition-colors ${cat === c.slug ? "border-verdigris bg-verdigris text-paper" : "border-line bg-surface hover:border-verdigris"}`}>{c.th}</button>
        ))}
      </div>

      <div ref={wrapRef} className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
        {/* แถบควบคุมลอย */}
        <div className="glass absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line/70 p-2 shadow-soft">
          <label className="flex min-w-[10rem] flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1 focus-within:border-verdigris">
            <Search size={15} className="text-muted" aria-hidden />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onSearchKey} placeholder="ค้นหาในกราฟ แล้วกด Enter เพื่อโฟกัส" aria-label="ค้นหาในกราฟ"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
            {q && <span className="shrink-0 text-xs text-muted">{matches.size} รายการ</span>}
          </label>
          <div className="flex items-center" role="group" aria-label="ตัวกรองชนิดโหนด">
            <Toggle on={showThinkers} set={setShowThinkers} color="var(--verdigris)" label="นักคิด (Thinkers)" />
            <Toggle on={showDebates} set={setShowDebates} color="var(--accent)" label="ข้อโต้แย้ง (Debates)" diamond />
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="ซูม">
            <IconBtn onClick={() => zoomBy(1.25)} label="ซูมเข้า"><ZoomIn size={16} /></IconBtn>
            <IconBtn onClick={() => zoomBy(0.8)} label="ซูมออก"><ZoomOut size={16} /></IconBtn>
            <IconBtn onClick={reset} label="รีเซ็ตมุมมอง"><RotateCcw size={15} /></IconBtn>
          </div>
        </div>

        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-none select-none" role="group" aria-label="กราฟความรู้">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--muted)" /></marker>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect x={0} y={0} width={W} height={H} fill="transparent" className="cursor-grab active:cursor-grabbing" onPointerDown={onBgDown} onPointerMove={onBgMove} onPointerUp={onBgUp} />
          <g transform={`translate(${tf.x} ${tf.y}) scale(${tf.k})`}>
            {links.map((l, i) => {
              const s = l.source as N, t = l.target as N;
              if (s.x == null || t.x == null || !visible(s) || !visible(t)) return null;
              const dx = t.x! - s.x!, dy = t.y! - s.y!, d = Math.hypot(dx, dy) || 1;
              const rT = t.kind === "debate" ? 18 : 19;
              const active = selected && (s.id === selected || t.id === selected);
              const off = (selected && !active) || (cat && !(s.categories.includes(cat) && t.categories.includes(cat))) || (q && !(matches.has(s.id) || matches.has(t.id)));
              return <line key={i} x1={s.x} y1={s.y} x2={t.x! - (dx / d) * rT} y2={t.y! - (dy / d) * rT} stroke={active ? "var(--verdigris)" : l.kind === "debate" ? "var(--accent)" : "var(--muted)"}
                strokeWidth={active ? 2 : 1} strokeDasharray={l.kind === "debate" ? "2 4" : undefined} opacity={off ? 0.08 : l.kind === "debate" ? 0.55 : 0.7} markerEnd="url(#arrow)" />;
            })}
            {nodes.filter(visible).map((n) => {
              const hit = matches.has(n.id);
              const dim = (selected && n.id !== selected && !neighbors.has(n.id)) || (cat && !n.categories.includes(cat)) || (q && !hit);
              const debate = n.kind === "debate";
              return (
                <g key={n.id} transform={`translate(${n.x ?? W / 2},${n.y ?? H / 2})`} opacity={dim ? 0.2 : 1} tabIndex={0} role="button" aria-label={n.label} aria-pressed={selected === n.id}
                  className="cursor-grab outline-none active:cursor-grabbing focus-visible:[&>*:first-child]:stroke-[4]"
                  onPointerDown={(e) => onNodeDown(e, n)} onPointerMove={(e) => onNodeMove(e, n)} onPointerUp={() => onNodeUp(n)}
                  onPointerEnter={(e) => { if (e.pointerType === "mouse") showTip(n); }} onPointerLeave={hideTip} onFocus={() => showTip(n)} onBlur={hideTip}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected((s) => (s === n.id ? null : n.id)); } }}>
                  {debate
                    ? <rect x={-12} y={-12} width={24} height={24} rx={4} transform="rotate(45)" fill="var(--surface)" stroke="var(--accent)" strokeWidth={3} filter="url(#glow)" />
                    : <circle r={16} fill={colorOf(n)} stroke={hit ? "var(--accent)" : "var(--surface)"} strokeWidth={hit ? 4 : 2.5} />}
                  <text y={debate ? 30 : 32} textAnchor="middle" fontSize={debate ? 12 : 14} fontWeight={debate ? 500 : 600} fill="var(--ink)" stroke="var(--paper)" strokeWidth={3} paintOrder="stroke">{n.label}</text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* การ์ดสรุปเมื่อ hover/โฟกัส */}
        {hov && hover && (
          <div onPointerEnter={keepTip} onPointerLeave={hideTip} role="tooltip" style={{ left: clamp(hover.x - 144, 8, Math.max(8, wrapW - 296)), top: hover.y + 26 }}
            className="glass absolute z-20 w-72 rounded-2xl border border-line/70 p-4 shadow-xl">
            <p className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: colorOf(hov) }}>
              <span aria-hidden className={`inline-block h-2.5 w-2.5 ${hov.kind === "debate" ? "rotate-45 rounded-[2px]" : "rounded-full"}`} style={{ background: colorOf(hov) }} />
              {hov.kind === "debate" ? "ข้อโต้แย้ง" : `${hov.era} · ${hov.tradition}`}
            </p>
            <p className="mt-1 text-base font-bold leading-snug">{hov.label}</p>
            <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-ink/80">{hov.summary}</p>
            <Link href={hov.href} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-verdigris px-3 py-1.5 text-sm font-semibold text-paper hover:opacity-90">
              {hov.kind === "debate" ? "อ่านข้อโต้แย้ง" : "อ่านบทความ"} <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line bg-sunk px-4 py-2 text-sm text-muted">
          {legend.map((l) => (<li key={l.t} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: l.c }} />{l.t}</li>))}
          <li className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rotate-45 rounded-[2px] border-2 border-accent shadow-[0_0_8px_var(--accent)]" />ข้อโต้แย้ง</li>
        </ul>
      </div>

      <div className="mt-3 min-h-[7rem] rounded-2xl border border-line bg-surface p-4 text-[15px]" aria-live="polite">
        {sel ? (
          <>
            <p className="text-lg font-bold">{sel.label}</p>
            {sel.era && <p className="text-sm text-muted">{sel.era} · {sel.tradition}</p>}
            {sel.kind === "debate"
              ? <p className="mt-2"><span className="text-muted">นักคิดที่เกี่ยวข้อง:</span> {names(related)}</p>
              : <><p className="mt-2"><span className="text-muted">รับอิทธิพลจาก:</span> {names(from)}</p><p><span className="text-muted">ส่งอิทธิพลต่อ:</span> {names(to)}</p>
                {related.length > 0 && <p><span className="text-muted">ข้อโต้แย้งที่เกี่ยวข้อง:</span> {names(related)}</p>}</>}
            <Link href={sel.href} className="mt-2 inline-block text-lapis underline underline-offset-2">{sel.kind === "debate" ? "อ่านข้อโต้แย้ง" : "อ่านบทความ"}</Link>
            {terms.some((t) => t.related_thinkers.includes(sel.id)) && (
              <p className="mt-2 text-sm"><span className="text-muted">คำศัพท์ที่เกี่ยวข้อง:</span>{" "}
                {terms.filter((t) => t.related_thinkers.includes(sel.id)).map((t, i) => (<span key={t.slug}>{i > 0 && ", "}<Link href={`/glossary/${t.slug}`} className="text-lapis underline">{t.term_th.split(" (")[0]}</Link></span>))}
              </p>)}
          </>
        ) : <p className="text-muted">คลิกโหนดเพื่อดูว่าใครส่งอิทธิพลต่อใคร หรือพิมพ์ชื่อในช่องค้นหาด้านบน</p>}
      </div>
    </section>
  );
}
