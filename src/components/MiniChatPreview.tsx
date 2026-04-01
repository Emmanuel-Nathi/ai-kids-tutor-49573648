import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const messages = [
  { role: "child", text: "What is 7 × 8?" },
  { role: "owl", text: "Great question! If you have 7 groups of 8 apples… how many apples is that?" },
  { role: "child", text: "56! 🎉" },
];

export function MiniChatPreview() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= messages.length) return;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 1200);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl border border-white/20 backdrop-blur-md bg-white/20 shadow-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-white/15 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-xs font-display font-semibold text-foreground/70">Live Preview</span>
      </div>
      <div className="p-4 space-y-3 min-h-[140px]">
        {messages.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`flex ${msg.role === "child" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] ${
                msg.role === "child"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary/20 text-foreground rounded-bl-md border border-secondary/20"
              }`}
            >
              {msg.role === "owl" && <span className="text-xs font-display font-semibold block mb-0.5 text-secondary">🦉 Owl Tutor</span>}
              {msg.text}
            </div>
          </motion.div>
        ))}
        {visibleCount < messages.length && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="flex gap-1 px-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
