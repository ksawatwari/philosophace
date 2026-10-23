// lib/quiz.ts — แบบทดสอบจุดยืนทางปรัชญา 5 ข้อ (pure: ใช้ได้ทั้ง server/client)
// แต่ละตัวเลือกให้คะแนนแก่ “สำนัก” หนึ่งหรือหลายสำนัก; ผลลัพธ์ = สำนักที่คะแนนสูงสุด
export type SchoolKey = "utilitarian" | "deontologist" | "stoic" | "existentialist" | "rationalist" | "empiricist";
export type School = {
  key: SchoolKey; th: string; en: string; tagline: string; description: string;
  thinkers: string[]; debates: string[]; terms: string[]; path: string;
};

export const SCHOOLS: School[] = [
  { key: "utilitarian", th: "นักประโยชน์นิยม", en: "Utilitarian", tagline: "ดีที่สุดคือสิ่งที่ทำให้คนมีความสุขรวมมากที่สุด",
    description: "คุณมองศีลธรรมผ่านผลลัพธ์: การกระทำที่ดีคือการกระทำที่ลดทุกข์และเพิ่มสุขของทุกคนที่เกี่ยวข้อง โดยนับทุกคนเท่ากัน จุดแข็งคือใช้ตัดสินนโยบายได้ชัดเจน จุดที่ควรระวังคือกรณีที่ผลดีรวมต้องแลกกับสิทธิของคนเพียงไม่กี่คน",
    thinkers: ["bentham", "mill", "singer"], debates: ["trolley-problem", "experience-machine"], terms: ["utilitarianism", "speciesism"], path: "ethics-and-justice" },
  { key: "deontologist", th: "นักหน้าที่นิยมแบบคานท์", en: "Kantian / Deontologist", tagline: "บางสิ่งผิดเสมอ ไม่ว่าผลจะดีเพียงใด",
    description: "คุณเชื่อว่าศีลธรรมมีหลักที่ไม่ต่อรอง: ต้องปฏิบัติต่อมนุษย์เป็นเป้าหมายในตัวเอง ไม่ใช่เครื่องมือ และกฎที่ใช้ต้องเป็นสากลได้ จุดแข็งคือปกป้องศักดิ์ศรีและสิทธิ จุดที่ควรระวังคือความแข็งทื่อเมื่อกฎชนกันหรือผลร้ายมหาศาล",
    thinkers: ["kant", "rawls", "foot"], debates: ["trolley-problem", "euthyphro-dilemma"], terms: ["categorical-imperative", "autonomy"], path: "ethics-and-justice" },
  { key: "stoic", th: "นักสโตอิก", en: "Stoic", tagline: "ควบคุมใจของตน ปล่อยสิ่งที่เหลือ",
    description: "คุณให้ค่ากับความมั่นคงภายใน: แยกสิ่งที่ขึ้นกับเรา (ความเห็น การเลือก) ออกจากสิ่งที่ไม่ขึ้นกับเรา แล้วฝึกใจให้สงบท่ามกลางความผันผวน จุดแข็งคือรับมือความเครียดได้ดี จุดที่ควรระวังคือการกดอารมณ์หรือยอมรับความอยุติธรรมเกินควร",
    thinkers: ["epictetus", "marcus-aurelius", "seneca"], debates: ["free-will-and-determinism", "problem-of-evil"], terms: ["ataraxia", "logos"], path: "existential-meaning" },
  { key: "existentialist", th: "นักอัตถิภาวนิยม", en: "Existentialist", tagline: "ไม่มีใครมอบความหมายให้ ฉันต้องสร้างเอง",
    description: "คุณเชื่อว่ามนุษย์เป็นอิสระและต้องรับผิดชอบการเลือกของตน ความหมายไม่ได้ถูกกำหนดไว้ล่วงหน้า แต่เกิดจากการกระทำและความกล้า จุดแข็งคือพลังในการเปลี่ยนชีวิต จุดที่ควรระวังคือการแบกความรับผิดชอบทั้งหมดไว้ที่ตัวเองจนลืมบริบททางสังคม",
    thinkers: ["kierkegaard", "sartre", "camus", "nietzsche"], debates: ["free-will-and-determinism", "experience-machine"], terms: ["existentialism", "absurd", "bad-faith"], path: "existential-meaning" },
  { key: "rationalist", th: "นักเหตุผลนิยม", en: "Rationalist", tagline: "ความจริงที่มั่นคงที่สุดมาจากการคิดอย่างเป็นระบบ",
    description: "คุณไว้ใจการคิดอย่างเป็นระบบมากกว่าความรู้สึกหรือการสังเกตที่หลอกได้ และเชื่อว่าโลกมีโครงสร้างที่เหตุผลเข้าถึงได้ จุดแข็งคือความชัดเจนและความสอดคล้อง จุดที่ควรระวังคือการลืมว่าข้อเสนอต้องผ่านการทดสอบกับโลกจริง",
    thinkers: ["descartes", "spinoza", "leibniz"], debates: ["evil-demon-and-simulation", "mind-body-problem"], terms: ["rationalism", "cogito"], path: "beginner-path" },
  { key: "empiricist", th: "นักประสบการณ์นิยมและผู้สงสัย", en: "Empiricist / Skeptic", tagline: "เชื่อเท่าที่มีหลักฐาน และพร้อมแก้ไขเสมอ",
    description: "คุณถามเสมอว่า “มีหลักฐานอะไร” ความรู้มาจากประสบการณ์และการทดสอบ และควรเปิดรับการถูกหักล้าง จุดแข็งคือไม่หลงเชื่อง่ายและแก้ไขตัวเองได้ จุดที่ควรระวังคือความสงสัยที่ลามจนไม่กล้าตัดสินใจ",
    thinkers: ["hume", "locke", "popper"], debates: ["problem-of-induction", "demarcation-problem"], terms: ["empiricism", "problem-of-induction", "falsificationism"], path: "beginner-path" },
];

export type Question = { id: string; theme: string; text: string; options: { label: string; score: Partial<Record<SchoolKey, number>> }[] };
export const QUESTIONS: Question[] = [
  { id: "morality", theme: "ศีลธรรม", text: "คุณเห็นคนหนึ่งต้องทำผิดเล็กน้อยเพื่อช่วยคนจำนวนมาก คุณคิดอย่างไร",
    options: [
      { label: "ถ้าผลรวมดีที่สุด ก็ควรทำ ผลลัพธ์คือสิ่งตัดสิน", score: { utilitarian: 2 } },
      { label: "กฎที่ถูกต้องต้องใช้กับทุกคนโดยไม่ยกเว้น แม้เจตนาจะดี", score: { deontologist: 2 } },
      { label: "สิ่งสำคัญคือเขาทำด้วยใจที่เป็นคุณธรรมและควบคุมตนเองได้หรือไม่", score: { stoic: 2 } },
      { label: "ไม่มีสูตรสำเร็จรูป เขาต้องเลือกเองและรับผิดชอบสิ่งที่เลือก", score: { existentialist: 2 } },
    ] },
  { id: "reality", theme: "ความจริงและความรู้", text: "ความรู้ที่เชื่อถือได้มากที่สุดมาจากอะไร",
    options: [
      { label: "การคิดอย่างเป็นระบบ เพราะประสาทสัมผัสหลอกเราได้", score: { rationalist: 2 } },
      { label: "ประสบการณ์และการทดสอบ ตรวจสอบได้ด้วยหลักฐาน", score: { empiricist: 2 } },
      { label: "ไม่แน่ใจเลยว่ารู้อะไรจริง จึงควรสงสัยไว้ก่อนเสมอ", score: { empiricist: 1, stoic: 1 } },
      { label: "ความรู้สึกและประสบการณ์ที่ฉันดำรงอยู่ในนั้น", score: { existentialist: 1 } },
    ] },
  { id: "freewill", theme: "เสรีภาพ", text: "ถ้าทุกเหตุการณ์มีเหตุนำมา คุณคิดว่าเรายังมีเสรีภาพหรือไม่",
    options: [
      { label: "ทุกอย่างมีเหตุ แต่เมื่อเข้าใจเหตุได้ เราก็เป็นอิสระมากขึ้น", score: { rationalist: 1, stoic: 1 } },
      { label: "เรามีเสรีภาพเต็มที่และต้องรับผิดชอบการเลือกของตน", score: { existentialist: 2 } },
      { label: "เสรีภาพคือการทำตามความต้องการโดยไม่ถูกบังคับ ซึ่งอยู่ร่วมกับเหตุปัจจัยได้", score: { empiricist: 2 } },
      { label: "เราเป็นผู้ให้กฎแก่ตนเองด้วยเหตุผล นั่นคือเสรีภาพ", score: { deontologist: 2 } },
    ] },
  { id: "suffering", theme: "ความหมายและความทุกข์", text: "เมื่อเจอเรื่องร้ายที่ควบคุมไม่ได้ คุณมักทำอย่างไร",
    options: [
      { label: "แยกสิ่งที่ควบคุมได้ออกจากที่ควบคุมไม่ได้ แล้วปล่อยส่วนหลัง", score: { stoic: 2 } },
      { label: "ยอมรับว่าไม่มีเหตุผลรองรับ แล้วสร้างความหมายขึ้นเอง", score: { existentialist: 2 } },
      { label: "วิเคราะห์สาเหตุเพื่อแก้ไขให้ได้ผลดีที่สุดกับทุกคนที่เกี่ยวข้อง", score: { utilitarian: 1, rationalist: 1 } },
      { label: "ทำหน้าที่ที่ควรทำต่อไป ไม่ว่าผลจะเป็นอย่างไร", score: { deontologist: 1, stoic: 1 } },
    ] },
  { id: "justice", theme: "สังคมที่ยุติธรรม", text: "สังคมที่ยุติธรรมควรเป็นอย่างไร",
    options: [
      { label: "ทำให้ความสุขรวมของคนทั้งสังคมสูงสุด", score: { utilitarian: 2 } },
      { label: "ปฏิบัติต่อทุกคนเป็นเป้าหมาย ไม่ใช่เครื่องมือของใคร", score: { deontologist: 2 } },
      { label: "ออกแบบกติกาที่ทุกคนใช้เหตุผลแล้วยอมรับได้", score: { rationalist: 2 } },
      { label: "ดูจากหลักฐานว่านโยบายใดได้ผลจริง แล้วปรับปรุงเรื่อย ๆ", score: { empiricist: 2 } },
    ] },
];

export function scoreAnswers(answers: (number | null)[]) {
  const total: Record<SchoolKey, number> = { utilitarian: 0, deontologist: 0, stoic: 0, existentialist: 0, rationalist: 0, empiricist: 0 };
  answers.forEach((a, qi) => { if (a === null) return; const sc = QUESTIONS[qi].options[a].score; (Object.keys(sc) as SchoolKey[]).forEach((k) => (total[k] += sc[k] ?? 0)); });
  const sum = Object.values(total).reduce((x, y) => x + y, 0) || 1;
  return SCHOOLS.map((s, i) => ({ school: s, score: total[s.key], pct: Math.round((total[s.key] / sum) * 100), order: i }))
    .sort((a, b) => b.score - a.score || a.order - b.order);
}
