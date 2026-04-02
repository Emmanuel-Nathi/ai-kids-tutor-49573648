import { motion } from "framer-motion";
import { Lock, Star, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OwlMascot } from "@/components/OwlMascot";
import { cn } from "@/lib/utils";
import type { MissionLevel } from "@/hooks/useMissionProgress";

interface MissionMapProps {
  levels: MissionLevel[];
  onStartMission: (activityId: string) => void;
}

export function MissionMap({ levels, onStartMission }: MissionMapProps) {
  return (
    <div className="relative py-8 px-4 max-w-md mx-auto">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 -left-20 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-56 h-56 rounded-full bg-secondary/8 blur-3xl" />
      </div>

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-center mb-8"
      >
        Your Learning Quest 🚀
      </motion.h2>

      <div className="relative flex flex-col items-center gap-0">
        {levels.map((level, index) => {
          const xOffset = index % 2 === 0 ? 40 : -40;
          const isCompleted = level.status === "completed";
          const isCurrent = level.status === "current";
          const isLocked = level.status === "locked";

          return (
            <motion.div
              key={level.activity.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col items-center"
              style={{ transform: `translateX(${xOffset}px)` }}
            >
              {/* Connector line */}
              {index > 0 && (
                <svg
                  width="80"
                  height="40"
                  className="absolute -top-10"
                  style={{
                    left: "50%",
                    transform: `translateX(${index % 2 === 0 ? -60 : 20}px)`,
                  }}
                >
                  <line
                    x1={index % 2 === 0 ? 60 : 20}
                    y1="0"
                    x2={index % 2 === 0 ? 20 : 60}
                    y2="40"
                    stroke={isCompleted || isCurrent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                    strokeWidth="3"
                    strokeDasharray={isCompleted ? "none" : "6 4"}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Owl on current node */}
              {isCurrent && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mb-1"
                >
                  <OwlMascot size="sm" animate pose="default" />
                </motion.div>
              )}

              {/* Level Node */}
              <motion.button
                onClick={() => isCurrent && onStartMission(level.activity.id)}
                disabled={isLocked}
                whileHover={isCurrent ? { scale: 1.1 } : {}}
                whileTap={isCurrent ? { scale: 0.95 } : {}}
                className={cn(
                  "relative w-16 h-16 rounded-full flex items-center justify-center transition-all",
                  "shadow-lg border-2",
                  isCompleted && "bg-secondary border-secondary text-secondary-foreground shadow-secondary/30",
                  isCurrent && "bg-primary border-primary text-primary-foreground shadow-primary/30 ring-4 ring-primary/20",
                  isLocked && "bg-muted border-muted-foreground/20 text-muted-foreground cursor-not-allowed opacity-60",
                )}
              >
                {/* Pulse effect on current */}
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary/30"
                  />
                )}
                {isCompleted ? <Star className="w-6 h-6 fill-current" /> :
                 isCurrent ? <Play className="w-6 h-6 fill-current" /> :
                 <Lock className="w-5 h-5" />}
              </motion.button>

              {/* Topic Label */}
              <div className="mt-2 mb-6 text-center max-w-[140px] backdrop-blur-md bg-white/20 border border-white/20 rounded-xl px-3 py-2">
                <p className={cn(
                  "font-display text-xs font-semibold leading-tight",
                  isLocked && "text-muted-foreground"
                )}>
                  {level.activity.topic}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] mt-1",
                    isCompleted && "border-secondary text-secondary",
                    isCurrent && "border-primary text-primary",
                  )}
                >
                  {level.activity.curriculum.toUpperCase()}
                </Badge>
              </div>
            </motion.div>
          );
        })}

        {/* Coming Soon placeholder */}
        {levels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: levels.length * 0.1 }}
            className="relative flex flex-col items-center"
            style={{ transform: `translateX(${levels.length % 2 === 0 ? 40 : -40}px)` }}
          >
            {/* Connector line */}
            <svg
              width="80"
              height="40"
              className="absolute -top-10"
              style={{
                left: "50%",
                transform: `translateX(${levels.length % 2 === 0 ? -60 : 20}px)`,
              }}
            >
              <line
                x1={levels.length % 2 === 0 ? 60 : 20}
                y1="0"
                x2={levels.length % 2 === 0 ? 20 : 60}
                y2="40"
                stroke="hsl(var(--muted-foreground) / 0.2)"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </svg>

            <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/30 bg-muted/50 opacity-60">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="mt-2 mb-6 text-center max-w-[140px] backdrop-blur-md bg-white/10 border border-dashed border-white/20 rounded-xl px-3 py-2">
              <p className="font-display text-xs font-semibold leading-tight text-muted-foreground">
                More adventures coming soon!
              </p>
              <Badge variant="outline" className="text-[9px] mt-1 border-muted-foreground/30 text-muted-foreground">
                COMING SOON
              </Badge>
            </div>
          </motion.div>
        )}

        {levels.length === 0 && (
          <div className="text-center py-12">
            <OwlMascot size="lg" pose="listen" message="No missions available yet! Ask your parent to set some up 📚" />
          </div>
        )}
      </div>
    </div>
  );
}
