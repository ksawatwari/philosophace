// lib/debate-kinds.ts — ค่าคงที่ประเภทข้อโต้แย้ง (pure: ปลอดภัยที่จะ import จาก Client Component; ห้ามใส่ fs ที่นี่)
export const DEBATE_KINDS = {
  "thought-experiment": "การทดลองทางความคิด",
  paradox: "ข้อขัดแย้ง",
  dilemma: "ปัญหาลำบากใจ",
  debate: "ข้อถกเถียงคลาสสิก",
} as const;
export type DebateKind = keyof typeof DEBATE_KINDS;
