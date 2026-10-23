// lib/paths.ts — เส้นทางเรียนรู้ (Guided Learning Paths) จาก content/paths/*.mdx + แปลง slug → ข้อมูลที่พร้อมแสดงผล
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { getEntry } from "./content";
import { getDebate } from "./debates";
import { getAllTerms } from "./glossary";
import { readMinutes } from "./readtime";

const DIR = path.join(process.cwd(), "content", "paths");
export const DIFFICULTY: Record<number, string> = { 1: "เริ่มต้น", 2: "ปานกลาง", 3: "ท้าทาย" };

const Ref = z.object({ type: z.enum(["thinker", "debate", "term"]), slug: z.string() });
const Step = Ref.extend({ why: z.string(), also: z.array(Ref).default([]) });
export const PathSchema = z.object({
  order: z.number(), title: z.string(), original: z.string(), summary: z.string(),
  difficulty: z.number().min(1).max(3), audience: z.string(), icon: z.string(),
  outcomes: z.array(z.string()), steps: z.array(Step).min(2),
});

export type ResolvedItem = { type: "thinker" | "debate" | "term"; slug: string; title: string; summary: string; href: string; minutes: number };
export type ResolvedStep = ResolvedItem & { why: string; also: ResolvedItem[] };
export type ResolvedPath = Omit<z.infer<typeof PathSchema>, "steps"> & { slug: string; steps: ResolvedStep[]; totalMinutes: number };

export function resolveItem(ref: { type: "thinker" | "debate" | "term"; slug: string }): ResolvedItem {
  if (ref.type === "thinker") {
    const e = getEntry(ref.slug); if (!e) throw new Error(`paths: ไม่พบนักคิด "${ref.slug}"`);
    return { ...ref, title: e.meta.title, summary: e.meta.summary, href: `/philosophy/${ref.slug}`, minutes: readMinutes(e.content) };
  }
  if (ref.type === "debate") {
    const d = getDebate(ref.slug); if (!d) throw new Error(`paths: ไม่พบข้อโต้แย้ง "${ref.slug}"`);
    return { ...ref, title: d.meta.title, summary: d.meta.summary, href: `/debates/${ref.slug}`, minutes: readMinutes(d.content) };
  }
  const t = getAllTerms().find((x) => x.slug === ref.slug); if (!t) throw new Error(`paths: ไม่พบศัพท์ "${ref.slug}"`);
  return { ...ref, title: t.term_th.split(" (")[0], summary: t.definition, href: `/glossary/${ref.slug}`, minutes: 1 };
}

export function getAllPaths(): ResolvedPath[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).map((f) => {
    const { data } = matter(fs.readFileSync(path.join(DIR, f), "utf8"));
    const r = PathSchema.safeParse(data);
    if (!r.success) throw new Error(`Frontmatter ผิดรูปแบบใน paths/${f}: ${r.error.message}`);
    const steps = r.data.steps.map((s) => ({ ...resolveItem(s), why: s.why, also: s.also.map(resolveItem) }));
    return { ...r.data, slug: f.replace(/\.mdx$/, ""), steps, totalMinutes: steps.reduce((a, s) => a + s.minutes, 0) };
  }).sort((a, b) => a.order - b.order);
}
export const getPath = (slug: string) => getAllPaths().find((p) => p.slug === slug) ?? null;
