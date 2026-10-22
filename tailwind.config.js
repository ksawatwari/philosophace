/** @type {import('tailwindcss').Config} */
// สีทุกตัวอ้างตัวแปร RGB (--x-rgb) เพื่อใช้ opacity modifier ได้ เช่น bg-accent/10
// ส่วนตัวแปรแบบ hex (--x) เก็บไว้ให้ SVG/inline style ใช้
const rgb = (n) => `rgb(var(--${n}-rgb) / <alpha-value>)`;
const anuphan = ["var(--font-anuphan)", "ui-sans-serif", "system-ui", "sans-serif"];

module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        paper: rgb("paper"), surface: rgb("surface"), sunk: rgb("sunk"),
        ink: rgb("ink"), muted: rgb("muted"), line: rgb("line"),
        verdigris: rgb("verdigris"), // มรกต: ปุ่ม/ลิงก์หลัก
        lapis: rgb("lapis"),         // คราม (muted indigo): ลิงก์รอง/อ้างอิง
        accent: rgb("accent"),       // อำพันเข้ม: ไฮไลต์ TL;DR / ข้อโต้แย้ง
      },
      fontFamily: { sans: anuphan, serif: anuphan }, // Anuphan ทั้งระบบ
      maxWidth: { reading: "46rem" },
      boxShadow: { soft: "0 1px 2px rgb(var(--ink-rgb) / 0.04), 0 8px 24px -12px rgb(var(--ink-rgb) / 0.12)" },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
