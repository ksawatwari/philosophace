// lib/lifeQuestions.ts — “คำถามชีวิต / เรื่องที่กังวล” สำหรับค้นหาแบบเข้าใจง่าย (pure: ใช้ได้ทั้ง server/client)
// รายชื่อสมาชิกคัดเลือกด้วยมือ (curated) ไม่ได้เดาจากคำ เพื่อให้ผลค้นหาตรงใจผู้เริ่มต้น
export type LifeQuestion = { key: string; th: string; icon: string; blurb: string; thinkers: string[]; debates: string[]; terms: string[] };

export const LIFE_QUESTIONS: LifeQuestion[] = [
  { key: "meaning", th: "ความหมายชีวิต", icon: "Compass", blurb: "เราอยู่ไปเพื่ออะไร ถ้าโลกไม่ได้ให้คำตอบมาให้",
    thinkers: ["kierkegaard", "nietzsche", "sartre", "camus", "schopenhauer", "buddha", "laozi", "zhuangzi", "epicurus", "dogen"],
    debates: ["experience-machine", "free-will-and-determinism"], terms: ["existentialism", "absurd", "eternal-recurrence", "bad-faith", "eudaimonia"] },
  { key: "justice", th: "ความยุติธรรม", icon: "Scale", blurb: "สังคมที่ยุติธรรมควรหน้าตาอย่างไร และใครควรได้อะไร",
    thinkers: ["rawls", "nozick", "locke", "hobbes", "rousseau", "mill", "arendt", "marx", "habermas", "singer"],
    debates: ["rawls-nozick-debate", "trolley-problem", "euthyphro-dilemma"], terms: ["veil-of-ignorance", "social-contract", "natural-law", "utilitarianism", "ubuntu"] },
  { key: "tech-future", th: "เทคโนโลยีและอนาคต", icon: "Cpu", blurb: "AI คิดได้ไหม โลกเสมือนจริงหรือเปล่า และเราจะอยู่กับเทคโนโลยีอย่างไร",
    thinkers: ["turing", "searle", "chalmers", "dennett", "bostrom", "floridi", "yuk-hui", "haraway", "simondon", "heidegger", "byung-chul-han", "latour", "baudrillard"],
    debates: ["turing-test", "chinese-room", "evil-demon-and-simulation", "teletransporter", "philosophical-zombies"],
    terms: ["cyborg", "cosmotechnics", "gestell", "extended-mind", "functionalism", "simulacra", "hard-problem-of-consciousness", "intentionality"] },
  { key: "moral-decisions", th: "การตัดสินใจเชิงศีลธรรม", icon: "HeartHandshake", blurb: "เมื่อต้องเลือกระหว่างสิ่งที่ถูกกับสิ่งที่ดีที่สุด เราใช้อะไรตัดสิน",
    thinkers: ["kant", "mill", "bentham", "foot", "hare", "aristotle", "parfit", "levinas", "singer"],
    debates: ["trolley-problem", "experience-machine", "euthyphro-dilemma", "rawls-nozick-debate"],
    terms: ["categorical-imperative", "utilitarianism", "autonomy", "arete", "eudaimonia", "is-ought-gap", "naturalistic-fallacy", "speciesism"] },
  { key: "self", th: "ตัวตนและความเป็นตัวเรา", icon: "Fingerprint", blurb: "อะไรทำให้ “ฉัน” เป็นฉัน และตัวตนมีอยู่จริงหรือเปล่า",
    thinkers: ["hume", "locke", "parfit", "buddha", "lacan", "descartes", "beauvoir", "butler", "merleau-ponty", "nagarjuna"],
    debates: ["teletransporter", "ship-of-theseus", "mind-body-problem", "knowledge-argument"], terms: ["personal-identity", "anatta", "cogito", "qualia", "face-of-the-other"] },
  { key: "peace", th: "ความสงบใจและการรับมือความทุกข์", icon: "Leaf", blurb: "จะอยู่กับสิ่งที่ควบคุมไม่ได้ ความเครียด และความสูญเสียอย่างไร",
    thinkers: ["epictetus", "marcus-aurelius", "seneca", "epicurus", "buddha", "laozi", "zhuangzi", "dogen", "spinoza"],
    debates: ["problem-of-evil", "free-will-and-determinism"], terms: ["ataraxia", "wu-wei", "anatta", "shunyata", "conatus"] },
  { key: "truth", th: "อะไรคือความจริงและความรู้", icon: "Lightbulb", blurb: "เรารู้อะไรได้จริง และจะแยกความรู้ออกจากความเชื่อได้อย่างไร",
    thinkers: ["descartes", "hume", "kant", "popper", "kuhn", "sextus-empiricus", "peirce", "quine", "husserl", "feyerabend"],
    debates: ["evil-demon-and-simulation", "problem-of-induction", "gettier-problem", "demarcation-problem"],
    terms: ["skepticism", "empiricism", "rationalism", "falsificationism", "paradigm-shift", "justified-true-belief", "problem-of-induction", "noumenon"] },
  { key: "freedom", th: "เสรีภาพและการเลือก", icon: "Feather", blurb: "เราเลือกได้จริงไหม และต้องรับผิดชอบแค่ไหน",
    thinkers: ["sartre", "spinoza", "kant", "mill", "kierkegaard", "beauvoir", "hume", "schopenhauer"],
    debates: ["free-will-and-determinism"], terms: ["autonomy", "existentialism", "bad-faith", "conatus"] },
  { key: "power", th: "อำนาจ สังคม และการต่อต้าน", icon: "Landmark", blurb: "อำนาจทำงานอย่างไรในชีวิตประจำวัน และเรามีทางตอบโต้อย่างไร",
    thinkers: ["foucault", "marx", "arendt", "agamben", "adorno", "habermas", "hobbes", "rousseau", "butler", "haraway"],
    debates: ["rawls-nozick-debate"], terms: ["biopower", "biopolitics", "culture-industry", "banality-of-evil", "social-contract", "ressentiment"] },
  { key: "faith", th: "ศรัทธา พระเจ้า และความชั่ว", icon: "Sparkles", blurb: "ถ้ามีพระเจ้า ทำไมจึงมีความทุกข์ และศีลธรรมต้องพึ่งศาสนาไหม",
    thinkers: ["augustine", "aquinas", "maimonides", "al-ghazali", "ibn-arabi", "leibniz", "kierkegaard", "spinoza", "shankara"],
    debates: ["problem-of-evil", "euthyphro-dilemma"], terms: ["theodicy", "natural-law", "wahdat-al-wujud", "maya"] },
];

export const lifeKeysFor = (type: "thinkers" | "debates" | "terms", slug: string) => LIFE_QUESTIONS.filter((q) => q[type].includes(slug)).map((q) => q.key);
