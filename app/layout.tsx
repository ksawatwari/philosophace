// app/layout.tsx — โครงหลัก: ฟอนต์ไทย, ธีม, Header/Sidebar/Footer
import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { getAllEntries } from "@/lib/content";
import { CATEGORIES } from "@/lib/taxonomy";

// Anuphan เป็น variable font (น้ำหนัก 100–700) ใช้เป็นฟอนต์เดียวทั้งระบบ: UI, หัวข้อ, เนื้อหา MDX
const anuphan = Anuphan({ subsets: ["thai", "latin"], variable: "--font-anuphan", display: "swap" });

export const metadata: Metadata = {
  title: { default: "คลังปรัชญา", template: "%s | คลังปรัชญา" },
  description: "สารานุกรมปรัชญาภาษาไทย ตั้งแต่โลกโบราณถึงปัจจุบัน พ.ศ. 2569",
};

// สคริปต์เล็ก ๆ ตั้งธีมก่อน React โหลด เพื่อไม่ให้หน้าจอกะพริบสว่างตอนเปิดโหมดมืด
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = getAllEntries().map((e) => ({ slug: e.slug, title: e.title, era: e.era }));
  return (
    <html lang="th" suppressHydrationWarning className={`${anuphan.variable} font-sans`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <Shell nav={nav} categories={CATEGORIES.map((c) => ({ slug: c.slug, th: c.th }))}>{children}</Shell>
      </body>
    </html>
  );
}
