import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Step = {
  role: "child" | "owl";
  label?: string;
  text: string;
};

const script: Step[] = [
  { role: "child", text: "What is 7 × 8?" },
  { role: "owl", label: "Encourage", text: "Great question! Let's think about it together 🦉" },
  { role: "owl", label: "Question", text: "If you have 7 groups of 8 apples, what could we do?" },
  { role: "child", text: "Add them up?" },
  { role: "owl", label: "Hint", text: "Exactly! Or… 7 × 8 is the same as 7 × 10 minus 7 × 2." },
  { role: "child", text: "56!" },
  { role: "owl", label: "Celebrate", text: "🎉 Brilliant! You used a smart shortcut!" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-secondary"
        />
      ))}
      <span className="ml-2 text-[10px] font-display text-muted-foreground">Owl is thinking…</span>
    </div>
  );
}

function WordByWord({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
          className="inline-block mr-1"
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

export function MiniChatPreview() {
  const [visible, setVisible] = useState<Step[]>([]);
  const [thinking, setThinking] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancel = false;

    const run = async () => {
      if (step >= script.length) {
        await new Promise((r) => setTimeout(r, 4000));
        if (cancel) return;
        setVisible([]);
        setStep(0);
        return;
      }
      const next = script[step];
      if (next.role === "owl") {
        setThinking(true);
        await new Promise((r) => setTimeout(r, 1200));
        if (cancel) return;
        setThinking(false);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        if (cancel) return;
      }
      setVisible((prev) => [...prev, next]);
      const wordCount = next.text.split(" ").length;
      await new Promise((r) => setTimeout(r, Math.max(900, wordCount * 90)));
      if (cancel) return;
      setStep((s) => s + 1);
    };

    run();
    return () => {
      cancel = true;
    };
  }, [step]);

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-white/40 backdrop-blur-xl bg-white/30 shadow-2xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/30 flex items-center gap-2 bg-white/20">
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-primary"
        />
        <span className="text-xs font-display font-semibold text-foreground/80">Live Owl Tutor Preview</span>
      </div>
      <div className="p-4 space-y-2.5 min-h-[260px]">
        <AnimatePresence>
          {visible.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "child" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3.5 py-2 rounded-2xl text-sm max-w-[82%] shadow-sm ${
                  msg.role === "child"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-white/70 text-foreground rounded-bl-md border border-white/50"
                }`}
              >
                {msg.role === "owl" && msg.label && (
                  <span className="text-[10px] font-display font-bold block mb-0.5 text-secondary uppercase tracking-wider">
                    🦉 {msg.label}
                  </span>
                )}
                <WordByWord text={msg.text} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/70 border border-white/50 rounded-2xl rounded-bl-md">
              <TypingDots />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
