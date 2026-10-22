"use client";
// components/ReadingProgress.tsx — แถบความคืบหน้าการอ่านบางบนสุดของหน้าจอ (framer-motion)
import { motion, useScroll, useSpring } from "framer-motion";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-verdigris via-lapis to-accent" />;
}
