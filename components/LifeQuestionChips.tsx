"use client";
// components/LifeQuestionChips.tsx — ชิป “คำถามชีวิต” ที่เปิดช่องค้นหารวมพร้อมตัวกรองนั้นทันที
import { LIFE_QUESTIONS } from "@/lib/lifeQuestions";
import { Icon } from "./Icon";

export function LifeQuestionChips() {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="ค้นหาจากคำถามชีวิต">
      {LIFE_QUESTIONS.map((q) => (
        <button key={q.key} onClick={() => window.dispatchEvent(new CustomEvent("open-search", { detail: { life: q.key } }))}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-sm transition-colors hover:border-verdigris hover:text-verdigris">
          <Icon name={q.icon} size={14} /> {q.th}
        </button>
      ))}
    </div>
  );
}
