// components/Icon.tsx — แมปชื่อไอคอน (string จาก taxonomy) → lucide component
import { BookOpen, FlaskConical, Brain, Gavel, Users, Globe, Scale, Compass, Lightbulb, Infinity as InfinityIcon, Landmark, Sparkles, HelpCircle, Route, Cpu, HeartHandshake, Fingerprint, Leaf, Feather, User, BookMarked, MessagesSquare, ListChecks, type LucideProps } from "lucide-react";

const MAP = { BookOpen, FlaskConical, Brain, Gavel, Users, Globe, Scale, Compass, Lightbulb, Infinity: InfinityIcon, Landmark, Sparkles, Route, Cpu, HeartHandshake, Fingerprint, Leaf, Feather, User, BookMarked, MessagesSquare, ListChecks } as const;

export function Icon({ name, ...p }: { name: string } & LucideProps) {
  const C = (MAP as Record<string, React.ComponentType<LucideProps>>)[name] ?? HelpCircle;
  return <C aria-hidden {...p} />;
}
