import owlDefault from "@/assets/owl-mascot.png";
import owlCelebrate from "@/assets/owl-celebrate.png";
import owlListen from "@/assets/owl-listen.png";
import owlWave from "@/assets/owl-wave.png";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface OwlMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  variant?: "idle" | "celebrate" | "thinking" | "blink";
  pose?: "default" | "celebrate" | "listen" | "wave";
  className?: string;
  message?: string;
  trackMouse?: boolean;
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-40 h-40",
  xl: "w-64 h-64",
};

const poseImages = {
  default: owlDefault,
  celebrate: owlCelebrate,
  listen: owlListen,
  wave: owlWave,
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

export function OwlMascot({ size = "md", animate = true, variant = "idle", pose = "default", className, message, trackMouse = false }: OwlMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), { stiffness: 150, damping: 18 });

  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!trackMouse) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [trackMouse, mouseX, mouseY]);

  useEffect(() => {
    if (!trackMouse) return;
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 10000);
    return () => clearInterval(interval);
  }, [trackMouse]);

  const imgSrc = poseImages[pose] || owlDefault;

  return (
    <div ref={containerRef} className={cn("flex flex-col items-center gap-3", className)}>
      <motion.div
        animate={animate ? variants[variant] : undefined}
        style={trackMouse ? { rotateX, rotateY, perspective: 600 } : undefined}
        className={cn(sizeMap[size], "relative")}
      >
        <motion.div
          animate={pulse ? { scale: [1, 1.08, 1], y: [0, -3, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <img
            src={imgSrc}
            alt="Owl Tutor mascot"
            className="w-full h-full object-contain drop-shadow-xl"
            loading="lazy"
          />
        </motion.div>
      </motion.div>
      {message && (
        <div className="relative max-w-[260px] rounded-2xl backdrop-blur-md bg-white/30 border border-white/20 px-5 py-3 text-center text-sm font-display shadow-lg">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white/30" />
          {message}
        </div>
      )}
    </div>
  );
}
