import owlLogo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface OwlMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
  message?: string;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

export function OwlMascot({ size = "md", animate = true, className, message }: OwlMascotProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <img
        src={owlLogo}
        alt="Owl Tutor mascot"
        className={cn(sizeMap[size], "object-contain drop-shadow-lg", animate && "animate-float")}
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
