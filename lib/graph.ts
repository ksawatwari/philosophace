// lib/graph.ts — แปลง frontmatter (influences / influenced_by) เป็นข้อมูลกราฟ; ไม่ใช้ fs จึง import ฝั่งไหนก็ได้
import type { Entry } from "./content";
import type { Debate } from "./debates";

export type GraphNode = { id: string; label: string; era: string; tradition: string; ghost: boolean; categories: string[]; kind: "thinker" | "debate"; href: string; summary: string };
export type GraphLink = { source: string; target: string; kind?: "influence" | "debate" }; // ทิศทาง: ผู้ให้อิทธิพล → ผู้รับอิทธิพล
export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

export function buildGraph(entries: Entry[], debates: Debate[] = []): GraphData {
  const nodes = new Map<string, GraphNode>();
  entries.forEach((e) => nodes.set(e.slug, { id: e.slug, label: e.title, era: e.era, tradition: e.tradition, ghost: false, categories: e.categories, kind: "thinker", href: `/philosophy/${e.slug}`, summary: e.summary }));

  const seen = new Set<string>();
  const links: GraphLink[] = [];
  const add = (from: string, to: string) => {
    const key = `${from}>${to}`;
    if (seen.has(key) || from === to) return; // กันเส้นซ้ำเมื่อสองบทความอ้างถึงกันทั้งสองฝั่ง
    // ทุกโหนดต้องมีบทความจริง: slug ที่ไม่มีไฟล์จะถูกข้าม (ไม่สร้างโหนดเส้นประ) พร้อมแจ้งเตือนตอน build
    for (const id of [from, to]) {
      if (!nodes.has(id)) { console.warn(`[graph] ไม่พบบทความ "${id}" — ข้ามความเชื่อมโยง ${from} → ${to}`); return; }
    }
    seen.add(key);
    links.push({ source: from, target: to });
  };

  for (const e of entries) {
    e.influences.forEach((t) => add(e.slug, t));
    e.influenced_by.forEach((f) => add(f, e.slug));
  }

  // ข้อโต้แย้ง/การทดลองทางความคิด = โหนดรูปข้าวหลามตัด; เส้นเชื่อมจากนักคิดหลักไปยังข้อโต้แย้งนั้น
  for (const d of debates) {
    const id = `debate:${d.slug}`;
    nodes.set(id, { id, label: d.title, era: "", tradition: "ข้อโต้แย้ง", ghost: false, categories: d.categories, kind: "debate", href: `/debates/${d.slug}`, summary: d.summary });
    for (const fig of d.key_figures) {
      if (!nodes.has(fig)) { console.warn(`[graph] debate ${d.slug}: ไม่พบนักคิด "${fig}"`); continue; }
      links.push({ source: fig, target: id, kind: "debate" });
    }
  }
  return { nodes: [...nodes.values()], links };
}
