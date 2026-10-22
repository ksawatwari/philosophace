# คลังปรัชญา (Philosophy Knowledge Platform)

    npm install
    npm run dev   # http://localhost:3000

เพิ่มบทความ: สร้างไฟล์ `content/philosophy/<slug>.mdx` ตาม schema ใน `lib/content.ts`
(slug ใน `influences` / `influenced_by` ต้องตรงกับชื่อไฟล์ของบทความอื่นเพื่อสร้างลิงก์และกราฟ)

ในเนื้อหา MDX ใช้ได้: `<Cite n={1} />`, `<QuoteCard author source>`, `<Trivia>`

## โครงสร้างหมวดหมู่และพจนานุกรม
- หมวดหมู่อยู่ที่ `lib/taxonomy.ts` (6 หมวด) ระบุในบทความด้วย `categories: ["science-language", ...]`
- คำศัพท์อยู่ที่ `content/glossary/<slug>.mdx` ใช้ในบทความด้วย `<Term name="slug">ข้อความ</Term>`
- ฟอนต์ทั้งระบบคือ Anuphan (`app/layout.tsx` + `tailwind.config.js`)

## ระบบดีไซน์ (UI/UX)
- โทเคนสี/ฟอนต์อยู่ที่ `app/globals.css` + `tailwind.config.js` (ตัวแปร `--x` เป็น hex สำหรับ SVG และ `--x-rgb` สำหรับ Tailwind opacity เช่น `bg-accent/10`)
- TL;DR + อุปมา: ใส่ `analogy:` และ (ถ้าต้องการ) `tldr: [3 ข้อ]` ใน frontmatter ของบทความ; ถ้าไม่ใส่ `tldr` จะสร้างอัตโนมัติ
- โพลข้อโต้แย้ง: ใส่ `poll:` (question + options[label, reveal, holders]) ใน frontmatter ของ `content/debates/*.mdx`
- สถิติโพลเก็บใน localStorage ของเบราว์เซอร์ผู้อ่านเท่านั้น (ไม่มีเซิร์ฟเวอร์) — หากต้องการสถิติรวม ให้เชื่อม API/DB เองในคอมโพเนนต์ `DebatePoll`
