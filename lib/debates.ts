// lib/debates.ts — การทดลองทางความคิด ข้อขัดแย้ง ปัญหาลำบากใจเชิงจริยธรรม และข้อถกเถียงคลาสสิก (ฝั่งเซิร์ฟเวอร์)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { CATEGORY_SLUGS } from "./taxonomy";

const DIR = path.join(process.cwd(), "content", "debates");

export const DEBATE_KINDS = {
  "thought-experiment": "การทดลองทางความคิด",
  paradox: "ข้อขัดแย้ง",
  dilemma: "ปัญหาลำบากใจ",
  debate: "ข้อถกเถียงคลาสสิก",
} as const;
export type DebateKind = keyof typeof DEBATE_KINDS;

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
