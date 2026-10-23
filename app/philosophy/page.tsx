// app/philosophy/page.tsx — แคตตาล็อก + ไทม์ไลน์
import type { Metadata } from "next";
import { getAllEntries } from "@/lib/content";
import { Catalog } from "@/components/Catalog";
import { Timeline } from "@/components/Timeline";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { buildGraph } from "@/lib/graph";
import { getAllTerms } from "@/lib/glossary";
import { getAllDebates } from "@/lib/debates";
import Link from "next/link";
import { ArrowRight, BookMarked, MessagesSquare, Network, Route } from "lucide-react";
import { LifeQuestionChips } from "@/components/LifeQuestionChips";

export const metadata: Metadata = { title: "แคตตาล็อกปรัชญา" };

export default function CatalogPage() {
  const entries = getAllEntries(); // อ่านตอน build → ส่งให้ไคลเอนต์ค้นหาทันทีโดยไม่ต้องมี API
  const terms = getAllTerms();
  const debates = getAllDebates();
  const stats = [{ n: entries.length, t: "นักคิด" }, { n: terms.length, t: "ศัพท์ปรัชญา" }, { n: debates.length, t: "ข้อโต้แย้ง" }];
  const starts = [
    { href: "/paths/beginner-path", k: "เส้นทางสำหรับมือใหม่", t: "จุดเริ่มต้น 5 ขั้น", d: "จากซอคราตีสถึงนีทเชอ เรียงลำดับพร้อมตัวติดตามความคืบหน้า" },
    { href: "/quiz", k: "ไม่รู้จะเริ่มตรงไหน?", t: "แบบทดสอบจุดยืน 5 ข้อ", d: "ดูว่าคุณใกล้สำนักไหน แล้วรับรายการอ่านเฉพาะคุณ" },
    { href: "/debates/trolley-problem", k: "ลองตัดสินใจ", t: "ปัญหารถราง", d: "เลือกก่อน แล้วดูว่านักคิดแต่ละสายคิดอย่างไร" },
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-14">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-verdigris/10 via-surface to-accent/10 p-7 shadow-soft sm:p-10">
        <p className="text-sm font-semibold text-accent">สารานุกรมปรัชญาภาษาไทย</p>
        <h1 className="display-h1 mt-2">คลังปรัชญา</h1>
        <p className="lead-text mt-3 max-w-2xl">จากโลกโบราณถึงยุค AI — ทุกบทความเริ่มด้วยสรุป 3 ข้อและอุปมาจากชีวิตประจำวัน เพื่อให้มือใหม่เข้าใจได้ก่อนลงลึก</p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2">{stats.map((x) => <div key={x.t}><dt className="sr-only">{x.t}</dt><dd className="text-2xl font-bold tabular-nums text-verdigris">{x.n}<span className="ml-1.5 text-sm font-medium text-muted">{x.t}</span></dd></div>)}</dl>
        <div className="mt-7"><p className="mb-2 text-sm font-semibold text-muted">มีเรื่องอะไรค้างคาใจ? ค้นหาจากคำถามชีวิต</p><LifeQuestionChips /></div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {starts.map((x) => (
            <li key={x.href}><Link href={x.href} className="group block h-full rounded-2xl border border-line bg-surface/80 p-4 transition-all hover:-translate-y-0.5 hover:border-verdigris">
              <p className="text-xs font-semibold text-muted">{x.k}</p>
              <p className="mt-0.5 flex items-center justify-between font-bold">{x.t}<ArrowRight size={16} className="text-verdigris transition-transform group-hover:translate-x-1" /></p>
              <p className="mt-1 text-sm text-muted">{x.d}</p>
            </Link></li>
          ))}
        </ul>
        <p className="mt-5 flex flex-wrap gap-4 text-sm">
          <a href="#graph" className="inline-flex items-center gap-1.5 text-lapis hover:underline"><Network size={15} /> ดูกราฟความสัมพันธ์</a>
          <Link href="/paths" className="inline-flex items-center gap-1.5 text-lapis hover:underline"><Route size={15} /> เส้นทางเรียนรู้</Link>
          <Link href="/debates" className="inline-flex items-center gap-1.5 text-lapis hover:underline"><MessagesSquare size={15} /> ข้อโต้แย้ง</Link>
          <Link href="/glossary" className="inline-flex items-center gap-1.5 text-lapis hover:underline"><BookMarked size={15} /> พจนานุกรม</Link>
        </p>
      </header>
      <Catalog entries={entries} />
      <KnowledgeGraph data={buildGraph(entries, debates)} terms={terms.map((t) => ({ slug: t.slug, term_th: t.term_th, related_thinkers: t.related_thinkers }))} />
      <Timeline items={entries.map((e) => ({ slug: e.slug, title: e.title, era: e.era, year: e.timeline_year }))} />
    </div>
  );
}
