import owlLogo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface OwlMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  variant?: "idle" | "celebrate" | "thinking" | "blink";
  className?: string;
  message?: string;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const variants = {
  idle: {
    y: [0, -8, 0],
    rotate: [0, 2, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
  celebrate: {
    y: [0, -16, 0, -10, 0],
    scale: [1, 1.15, 1, 1.1, 1],
    rotate: [0, -5, 5, -3, 0],
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
  thinking: {
    rotate: [-3, 3, -3],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
  },
  blink: {
    opacity: [1, 0.3, 1],
    transition: { duration: 0.4, repeat: 2 },
  },
};

export function OwlMascot({ size = "md", animate = true, variant = "idle", className, message }: OwlMascotProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.img
        src={owlLogo}
        alt="Owl Tutor mascot"
        className={cn(sizeMap[size], "object-contain drop-shadow-lg")}
        animate={animate ? variants[variant] : undefined}
      />
      {message && (
        <div className="relative max-w-[240px] rounded-2xl bg-card px-4 py-2 text-center text-sm font-display shadow-md border border-border">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-card" />
          {message}
        </div>
      )}
    </div>
  );
}
