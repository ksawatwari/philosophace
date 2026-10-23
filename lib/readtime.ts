// lib/readtime.ts — ประมาณเวลาอ่านภาษาไทย (≈ 1,000 อักขระ/นาที) ใช้ได้ทั้งฝั่งเซิร์ฟเวอร์/ไคลเอนต์
export const readMinutes = (mdx: string) => Math.max(1, Math.round(mdx.replace(/<[^>]+>/g, "").length / 1000));
