// lib/content.ts — โหลดและตรวจสอบ MDX ฝั่งเซิร์ฟเวอร์ (ใช้ได้เฉพาะ Server Components / build time)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { CATEGORY_SLUGS } from "./taxonomy";

const DIR = path.join(process.cwd(), "content", "philosophy");

/** Schema ของ frontmatter — ถ้าไฟล์ MDX ผิดรูปแบบ build จะ fail พร้อมบอกว่าไฟล์ไหน */
export const FrontmatterSchema = z.object({
  title: z.string(),                       // ชื่อภาษาไทย
  original_name: z.string(),               // ชื่อภาษาต้นทาง
  summary: z.string(),                     // คำโปรยสั้น ใช้ในการ์ดและ SEO
  era: z.string(),                         // กรีกโบราณ | ยุคกลาง | สมัยใหม่ | ศตวรรษที่ 21
  tradition: z.string(),                   // ตะวันตก | ตะวันออก | ปรัชญาอิสลาม ...
  branch: z.array(z.string()),             // จริยศาสตร์, อภิปรัชญา, ...
  categories: z.array(z.enum(CATEGORY_SLUGS)).default([]), // หมวดหมู่ระดับบน ดู lib/taxonomy.ts
  birth_death: z.string(),                 // "พ.ศ. 2502 (ค.ศ. 1959) – ปัจจุบัน"
  timeline_year: z.number(),               // ปี ค.ศ. สำหรับเรียงบนไทม์ไลน์ (ก่อน ค.ศ. = ติดลบ)
  key_concepts: z.array(z.string()),
  influences: z.array(z.string()).default([]),    // slug ของผู้ที่เขาส่งอิทธิพลต่อ → edge ใน Knowledge Graph
  influenced_by: z.array(z.string()).default([]), // slug ของผู้ที่ส่งอิทธิพลต่อเขา
  citations: z.array(z.string()).default([]),     // APA/Chicago ตามลำดับเลขเชิงอรรถ
  analogy: z.string().optional(),               // อุปมาในชีวิตปัจจุบัน (แสดงใน TL;DR)
  tldr: z.array(z.string()).optional(),          // ถ้าไม่ระบุ จะสร้างอัตโนมัติจาก summary + key_concepts + ความเชื่อมโยง
  draft: z.boolean().default(false),
});
export type Frontmatter = z.infer<typeof FrontmatterSchema>;
export type Entry = Frontmatter & { slug: string };

export function getAllEntries(): Entry[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(DIR, f), "utf8"));
      const parsed = FrontmatterSchema.safeParse(data);
      if (!parsed.success) throw new Error(`Frontmatter ผิดรูปแบบใน ${f}: ${parsed.error.message}`);
      return { ...parsed.data, slug: f.replace(/\.mdx$/, "") };
    })
    .filter((e) => !e.draft)
    .sort((a, b) => a.timeline_year - b.timeline_year);
}

export function getEntry(slug: string) {
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { meta: { ...FrontmatterSchema.parse(data), slug }, content };
}
