// lib/debates.ts — การทดลองทางความคิด ข้อขัดแย้ง ปัญหาลำบากใจเชิงจริยธรรม และข้อถกเถียงคลาสสิก (ฝั่งเซิร์ฟเวอร์)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { CATEGORY_SLUGS } from "./taxonomy";

const DIR = path.join(process.cwd(), "content", "debates");

import { DEBATE_KINDS, type DebateKind } from "./debate-kinds";
export { DEBATE_KINDS };
export type { DebateKind };

export const DebateSchema = z.object({
  title: z.string(),
  original_name: z.string(),
  kind: z.enum(["thought-experiment", "paradox", "dilemma", "debate"]),
  summary: z.string(),
  originator: z.string(),                     // ผู้เสนอหรือที่มา เช่น “ฟิลิปปา ฟุต (1967)”
  timeline_year: z.number(),
  branch: z.array(z.string()),
  categories: z.array(z.enum(CATEGORY_SLUGS)).default([]),
  key_figures: z.array(z.string()).default([]),   // slug นักคิด → เส้นเชื่อมในกราฟ
  related_terms: z.array(z.string()).default([]), // slug ศัพท์
  positions: z.array(z.object({ label: z.string(), holders: z.array(z.string()).default([]), claim: z.string() })).default([]),
  citations: z.array(z.string()).default([]),
  // โพลตัดสินใจ: ผู้อ่านเลือกข้อใดข้อหนึ่งแล้วเปิดดูการวิเคราะห์เชิงปรัชญา
  poll: z.object({
    question: z.string(),
    options: z.array(z.object({ label: z.string(), reveal: z.string(), holders: z.array(z.string()).default([]) })),
  }).optional(),
});
export type Debate = z.infer<typeof DebateSchema> & { slug: string };

export function getAllDebates(): Debate[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).map((f) => {
    const { data } = matter(fs.readFileSync(path.join(DIR, f), "utf8"));
    const r = DebateSchema.safeParse(data);
    if (!r.success) throw new Error(`Frontmatter ผิดรูปแบบใน debates/${f}: ${r.error.message}`);
    return { ...r.data, slug: f.replace(/\.mdx$/, "") };
  }).sort((a, b) => a.timeline_year - b.timeline_year);
}

export function getDebate(slug: string) {
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { meta: { ...DebateSchema.parse(data), slug }, content };
}

// ---- ความเชื่อมโยงสองทาง (ใช้ที่หน้าศัพท์และหน้านักคิด) ----

/** ข้อโต้แย้งที่อ้างถึงศัพท์หนึ่งคำ: อยู่ใน related_terms หรือใช้ <Term name="…"> ในเนื้อหา */
export function getDebatesUsingTerm(termSlug: string): Debate[] {
  if (!fs.existsSync(DIR)) return [];
  const re = new RegExp(`<Term name="${termSlug.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}"`);
  return getAllDebates().filter((d) => {
    if (d.related_terms.includes(termSlug)) return true;
    return re.test(fs.readFileSync(path.join(DIR, `${d.slug}.mdx`), "utf8"));
  });
}

/** ข้อโต้แย้งที่เกี่ยวกับนักคิด: key_figures ∪ ผู้ถือจุดยืน ∪ ผู้ถูกอ้างในโพล; ถ้าไม่มีเลย → หัวข้อใกล้เคียงตามสาขา/หมวด (เพื่อให้ทุกบทความมีบล็อกนี้) */
export function relatedDebatesFor(all: Debate[], slug: string, branch: string[], categories: string[]): { items: Debate[]; direct: boolean } {
  const direct = all.filter((d) => d.key_figures.includes(slug) || d.positions.some((p) => p.holders.includes(slug)) || (d.poll?.options ?? []).some((o) => o.holders.includes(slug)));
  if (direct.length) return { items: direct, direct: true };
  const score = (d: Debate) => d.branch.filter((b) => branch.includes(b)).length * 2 + d.categories.filter((c) => categories.includes(c)).length;
  const near = [...all].sort((a, b) => score(b) - score(a)).filter((d) => score(d) > 0).slice(0, 3);
  return { items: near.length ? near : all.slice(0, 3), direct: false };
}
