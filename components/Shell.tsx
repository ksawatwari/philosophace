"use client";
// components/Shell.tsx — Header + Sidebar (drawer บนมือถือ) + Footer
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Moon, Sun, Search, Landmark } from "lucide-react";

type NavItem = { slug: string; title: string; era: string };

export function Shell({ nav, categories, children }: { nav: NavItem[]; categories: { slug: string; th: string }[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add("theme-transition"); // ทรานซิชันนุ่ม ๆ เฉพาะตอนสลับธีม
    const dark = root.classList.toggle("dark");
    window.setTimeout(() => root.classList.remove("theme-transition"), 450);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
  };

  // จัดกลุ่มรายการในแถบด้านข้างตามยุค
  const groups = nav.reduce<Record<string, NavItem[]>>((acc, n) => ((acc[n.era] ||= []).push(n), acc), {});

  return (
    <>
      <header className="glass sticky top-0 z-40 border-b border-line/70">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <button className="lg:hidden p-2 -ml-2" aria-label="เปิดเมนู" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-verdigris/10 text-verdigris"><Landmark size={18} /></span> คลังปรัชญา
          </Link>
          <nav className="ml-6 hidden gap-5 text-sm text-muted md:flex">
            <Link href="/philosophy" className="hover:text-ink">แคตตาล็อก</Link>
            <Link href="/glossary" className="hover:text-ink">พจนานุกรมศัพท์</Link>
            <Link href="/debates" className="hover:text-ink">ข้อโต้แย้ง</Link>
            <Link href="/philosophy#graph" className="hover:text-ink">กราฟความสัมพันธ์</Link>
            <Link href="/philosophy#timeline" className="hover:text-ink">ไทม์ไลน์</Link>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/philosophy" aria-label="ค้นหา" className="p-2"><Search size={20} /></Link>
            <button onClick={toggleTheme} aria-label="สลับโหมดสว่าง/มืด" className="p-2">
              <Sun size={20} className="hidden dark:block" /><Moon size={20} className="dark:hidden" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar: ถาวรบนจอใหญ่, เลื่อนเข้ามาบนมือถือ */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-line bg-surface p-5 transition-transform lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:bg-transparent ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <button className="mb-4 lg:hidden" aria-label="ปิดเมนู" onClick={() => setOpen(false)}><X size={22} /></button>
          <div className="mb-6">
            <p className="mb-1 text-sm font-semibold text-lapis">หมวดหมู่</p>
            <ul className="space-y-0.5 text-[15px]">
              {categories.map((c) => (
                <li key={c.slug}><Link href={`/category/${c.slug}`} onClick={() => setOpen(false)} className="block rounded px-2 py-1 text-muted hover:bg-line/50 hover:text-ink">{c.th}</Link></li>
              ))}
            </ul>
          </div>
          {Object.entries(groups).map(([era, items]) => (
            <div key={era} className="mb-5">
              <p className="mb-1 text-sm font-semibold text-verdigris">{era}</p>
              <ul className="space-y-0.5 text-[15px]">
                {items.map((i) => (
                  <li key={i.slug}>
                    <Link href={`/philosophy/${i.slug}`} onClick={() => setOpen(false)} className="block rounded px-2 py-1 text-muted hover:bg-line/50 hover:text-ink">
                      {i.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
        {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

        <main className="min-w-0 flex-1 px-4 py-8 lg:px-10">{children}</main>
      </div>

      <footer className="mt-20 border-t border-line bg-sunk py-10 text-center text-sm text-muted">
        คลังปรัชญา · พ.ศ. 2569 · จัดทำเพื่อการศึกษาส่วนบุคคลและกลุ่มเล็ก
      </footer>
    </>
  );
}
