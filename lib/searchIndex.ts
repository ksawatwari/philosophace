// lib/searchIndex.ts — ดัชนีค้นหารวม (นักคิด ศัพท์ ข้อโต้แย้ง เส้นทาง) + แท็ก “คำถามชีวิต”; ใช้ที่ route /search-index.json
import { getAllEntries } from "./content";
import { getAllTerms } from "./glossary";
import { getAllDebates, DEBATE_KINDS } from "./debates";
import { getAllPaths } from "./paths";
import { lifeKeysFor } from "./lifeQuestions";

export type SearchItem = { type: "thinker" | "term" | "debate" | "path"; slug: string; title: string; sub: string; summary: string; href: string; tags: string[]; life: string[] };

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const e of getAllEntries()) items.push({ type: "thinker", slug: e.slug, title: e.title, sub: `${e.original_name} · ${e.era}`, summary: e.summary, href: `/philosophy/${e.slug}`,
    tags: [e.era, e.tradition, ...e.branch, ...e.key_concepts, e.analogy ?? ""].filter(Boolean), life: lifeKeysFor("thinkers", e.slug) });
  for (const t of getAllTerms()) items.push({ type: "term", slug: t.slug, title: t.term_th.split(" (")[0], sub: t.term_original, summary: t.definition, href: `/glossary/${t.slug}`,
    tags: [t.language, ...t.branch], life: lifeKeysFor("terms", t.slug) });
  for (const d of getAllDebates()) items.push({ type: "debate", slug: d.slug, title: d.title, sub: `${d.original_name} · ${DEBATE_KINDS[d.kind]}`, summary: d.summary, href: `/debates/${d.slug}`,
    tags: [DEBATE_KINDS[d.kind], ...d.branch, d.poll?.question ?? ""].filter(Boolean), life: lifeKeysFor("debates", d.slug) });
  for (const p of getAllPaths()) {
    const life = new Set<string>();
    p.steps.forEach((s) => lifeKeysFor(s.type === "thinker" ? "thinkers" : s.type === "debate" ? "debates" : "terms", s.slug).forEach((k) => life.add(k)));
    items.push({ type: "path", slug: p.slug, title: p.title, sub: `เส้นทางเรียนรู้ · ${p.steps.length} ขั้น`, summary: p.summary, href: `/paths/${p.slug}`, tags: [p.audience, ...p.outcomes], life: [...life] });
  }
  return items;
}
