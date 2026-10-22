"use client";
// components/TocSidebar.tsx — สารบัญเหนียว (sticky) ที่ยุบอัตโนมัติ: ยุบเป็นแถบบาง ๆ เมื่อไม่ได้ใช้ และขยายเมื่อเอาเมาส์/โฟกัสเข้า (ปักหมุดได้)
import { useEffect, useState } from "react";
import { List, Pin, PinOff } from "lucide-react";

export function TocSidebar({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  const expanded = pinned || hover;
  return (
    <nav aria-label="สารบัญ" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}
      className="sticky top-24 text-sm">
      <div className="flex items-center justify-between gap-2 text-muted">
        <span className="flex items-center gap-1.5 font-semibold"><List size={15} aria-hidden /> สารบัญ</span>
        <button onClick={() => setPinned((v) => !v)} aria-pressed={pinned} aria-label={pinned ? "ยุบสารบัญอัตโนมัติ" : "ปักหมุดสารบัญ"} className="rounded p-1 hover:bg-sunk hover:text-ink">
          {pinned ? <Pin size={14} /> : <PinOff size={14} />}
        </button>
      </div>
      <ul className="mt-3 space-y-0.5 border-l border-line">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={on ? "true" : undefined}
                className={`-ml-px block border-l-2 py-1 pl-3 transition-all ${on ? "border-verdigris font-semibold text-verdigris" : "border-transparent text-muted hover:text-ink"} ${expanded ? "opacity-100" : on ? "opacity-100" : "opacity-40"}`}>
                <span className={expanded ? "inline" : "sr-only"}>{i.text}</span>
                {!expanded && <span aria-hidden className="block h-3" />}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
