// lib/progress.ts — ติดตามความคืบหน้าการอ่านใน localStorage (ฝั่งไคลเอนต์เท่านั้น; ทุกฟังก์ชันครอบ try/catch)
export type ItemType = "thinker" | "debate" | "term";
const VISITED = "visited:v1";
const key = (t: ItemType, s: string) => `${t}:${s}`;
const read = (k: string): string[] => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
const write = (k: string, v: string[]) => { try { localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event("progress-change")); } catch {} };

export const readVisited = () => new Set(read(VISITED));
export const markVisited = (t: ItemType, s: string) => { const v = readVisited(); if (!v.has(key(t, s))) { v.add(key(t, s)); write(VISITED, [...v]); } };
export const readManual = (path: string) => new Set(read(`pathdone:${path}`));
export const toggleManual = (path: string, t: ItemType, s: string) => { const v = readManual(path); const k = key(t, s); v.has(k) ? v.delete(k) : v.add(k); write(`pathdone:${path}`, [...v]); };
export const stepKey = key;
