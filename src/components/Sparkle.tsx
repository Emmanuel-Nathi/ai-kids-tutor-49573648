import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface SparkleProps {
  active?: boolean;
  count?: number;
  className?: string;
}

export function Sparkle({ active = false, count = 5, className = "" }: SparkleProps) {
  return (
    <AnimatePresence>
      {active && (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: "50%", y: "50%" }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: `${30 + Math.random() * 40}%`,
                y: `${Math.random() * 80}%`,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.8 + Math.random() * 0.6,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              className="absolute"
            >
              <Star className="w-4 h-4 text-star-gold fill-star-gold" />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
