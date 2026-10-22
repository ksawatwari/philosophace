// lib/glossary.ts — โหลดคำศัพท์จาก content/glossary/*.mdx (ฝั่งเซิร์ฟเวอร์เท่านั้น)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const DIR = path.join(process.cwd(), "content", "glossary");

export const GlossarySchema = z.object({
  term_th: z.string(),                          // หัวคำภาษาไทย
  term_original: z.string(),                    // คำต้นฉบับ (ละติน/อักษรโรมัน + อักษรเดิมในวงเล็บถ้ามี)
  language: z.string(),                         // ภาษาต้นทาง เช่น กรีกโบราณ, เยอรมัน, บาลี
  branch: z.array(z.string()),                  // สาขา: ใช้เป็นแท็กกรอง
  definition: z.string(),                       // นิยามสั้น (แสดงใน popover)
  historical_context: z.string(),               // บริบททางประวัติศาสตร์/การถกเถียง
  related_thinkers: z.array(z.string()).default([]), // slug ของบทความนักคิด
  citations: z.array(z.string()).default([]),
});
export type GlossaryEntry = z.infer<typeof GlossarySchema> & { slug: string };

export function getAllTerms(): GlossaryEntry[] {
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).map((f) => {
    const { data } = matter(fs.readFileSync(path.join(DIR, f), "utf8"));
    const r = GlossarySchema.safeParse(data);
    if (!r.success) throw new Error(`Frontmatter ผิดรูปแบบใน glossary/${f}: ${r.error.message}`);
    return { ...r.data, slug: f.replace(/\.mdx$/, "") };
  }).sort((a, b) => a.term_original.localeCompare(b.term_original));
}

export const getTerm = (slug: string) => getAllTerms().find((t) => t.slug === slug) ?? null;
