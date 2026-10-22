// lib/glossary-utils.ts — ฟังก์ชันล้วน ๆ (ไม่ใช้ fs) ใช้ได้ทั้งฝั่งเซิร์ฟเวอร์และไคลเอนต์
export const THAI_LETTERS = "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ".split("");
export const LATIN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** พยัญชนะต้นของคำไทย: ข้ามสระนำ เ แ โ ใ ไ เพื่อให้ "เหริน" เรียงที่ ห และ "โคจิโต" เรียงที่ ค */
export const thaiInitial = (s: string) => s.replace(/^[เแโใไ]/, "")[0] ?? "";

/** อักษรต้นของคำต้นฉบับ: ตัดเครื่องหมายกำกับ (ā, ī, é) ให้เหลือ A–Z */
export const latinInitial = (s: string) => (s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")[0] ?? "").toUpperCase();
