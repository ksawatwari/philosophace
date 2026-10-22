// components/MiniGraph.tsx — กราฟย่อบนหน้าบทความ: ผู้ให้อิทธิพล (ซ้าย) → นักคิดคนนี้ (กลาง) → ผู้รับอิทธิพล (ขวา)
// + แถวล่างคือศัพท์ที่เกี่ยวข้อง ทุกโหนดที่มีหน้าจริงเป็นลิงก์; โหนดเส้นประคือผู้ที่ถูกอ้างถึงแต่ยังไม่มีบทความ
// เป็น Server Component ล้วน ๆ (ไม่ต้องใช้ d3 เพราะเลย์เอาต์คงที่)
import Link from "next/link";
import type { GraphData, GraphNode } from "@/lib/graph";

type Term = { slug: string; term_th: string };
const cut = (s: string, n = 16) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function MiniGraph({ centerId, data, terms }: { centerId: string; data: GraphData; terms: Term[] }) {
  const find = (id: string) => data.nodes.find((n) => n.id === id);
  const center = find(centerId);
  const ins = data.links.filter((l) => l.target === centerId).map((l) => find(l.source)).filter(Boolean) as GraphNode[];
  const outs = data.links.filter((l) => l.source === centerId).map((l) => find(l.target)).filter(Boolean) as GraphNode[];
  if (!center || (ins.length + outs.length + terms.length === 0)) return null;

  const W = 640, rowH = 44, top = 30, rows = Math.max(ins.length, outs.length, 1);
  const mid = top + (rows * rowH) / 2;
  const H = top + rows * rowH + (terms.length ? 76 : 10);
  const yAt = (i: number, n: number) => mid + (i - (n - 1) / 2) * rowH;
  const LX = 150, CX = 320, RX = 490;

  const Item = ({ n, x, y, side }: { n: GraphNode; x: number; y: number; side: "l" | "r" }) => {
    const body = (
      <g>
        <circle cx={x} cy={y} r={n.ghost ? 8 : 12} fill={n.ghost ? "var(--surface)" : "var(--lapis)"} stroke="var(--lapis)" strokeWidth={2} strokeDasharray={n.ghost ? "3 3" : undefined} />
        <text x={side === "l" ? x - 18 : x + 18} y={y + 5} textAnchor={side === "l" ? "end" : "start"} fontSize={13} fill="var(--ink)">{cut(n.label)}</text>
        {n.ghost && <title>ยังไม่มีบทความของ {n.label}</title>}
      </g>
    );
    return n.ghost ? body : <Link href={`/philosophy/${n.id}`} aria-label={n.label}>{body}</Link>;
  };

  return (
    <section className="mt-12 border-t border-line pt-6" aria-label="เครือข่ายความคิด">
      <h2 className="font-serif text-2xl font-bold">เครือข่ายความคิด</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-surface">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="group">
          <defs><marker id="mini-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)" /></marker></defs>
          <text x={LX - 18} y={16} textAnchor="end" fontSize={12} fill="var(--muted)">รับอิทธิพลจาก</text>
          <text x={RX + 18} y={16} fontSize={12} fill="var(--muted)">ส่งอิทธิพลต่อ</text>
          {ins.map((n, i) => <line key={n.id} x1={LX + 14} y1={yAt(i, ins.length)} x2={CX - 22} y2={mid} stroke="var(--muted)" opacity={0.7} markerEnd="url(#mini-arrow)" />)}
          {outs.map((n, i) => <line key={n.id} x1={CX + 18} y1={mid} x2={RX - 16} y2={yAt(i, outs.length)} stroke="var(--muted)" opacity={0.7} markerEnd="url(#mini-arrow)" />)}
          {ins.map((n, i) => <Item key={n.id} n={n} x={LX} y={yAt(i, ins.length)} side="l" />)}
          {outs.map((n, i) => <Item key={n.id} n={n} x={RX} y={yAt(i, outs.length)} side="r" />)}
          <circle cx={CX} cy={mid} r={18} fill="var(--verdigris)" />
          <text x={CX} y={mid + 38} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--ink)">{cut(center.label, 20)}</text>

          {terms.length > 0 && (
            <g>
              <text x={10} y={top + rows * rowH + 22} fontSize={12} fill="var(--muted)">คำศัพท์ที่เกี่ยวข้อง</text>
              {terms.map((t, i) => {
                const x = (W / (terms.length + 1)) * (i + 1), y = top + rows * rowH + 48;
                return (
                  <Link key={t.slug} href={`/glossary/${t.slug}`} aria-label={t.term_th}>
                    <rect x={x - 6} y={y - 6} width={12} height={12} rx={2} fill="var(--surface)" stroke="var(--verdigris)" strokeWidth={2} />
                    <text x={x} y={y + 22} textAnchor="middle" fontSize={12} fill="var(--ink)">{cut(t.term_th, 14)}</text>
                  </Link>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}
