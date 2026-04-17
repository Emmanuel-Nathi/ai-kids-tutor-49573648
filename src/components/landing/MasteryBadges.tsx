import { motion } from "framer-motion";

const badges = [
  { emoji: "➗", name: "Division Champ", curriculum: "CAPS", gradient: "from-primary/40 to-primary/10" },
  { emoji: "🧠", name: "Critical Thinker", curriculum: "IEB", gradient: "from-secondary/40 to-secondary/10" },
  { emoji: "🔬", name: "Scientific Method", curriculum: "Cambridge", gradient: "from-primary/30 to-secondary/20" },
  { emoji: "📖", name: "Reading Star", curriculum: "CAPS", gradient: "from-secondary/30 to-primary/20" },
  { emoji: "✍️", name: "Word Wizard", curriculum: "IEB", gradient: "from-primary/40 to-secondary/10" },
  { emoji: "🧭", name: "Math Explorer", curriculum: "Cambridge", gradient: "from-secondary/40 to-primary/20" },
];

export function MasteryBadges() {
  return (
    <section className="px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            The Path to Mastery
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-lg">
            Earn tactile mastery badges aligned to your curriculum
          </p>
        </motion.div>

        <div className="flex sm:hidden gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          {badges.map((b, i) => (
            <BadgeCard key={b.name} badge={b} index={i} className="min-w-[160px] snap-center" />
          ))}
        </div>

        <div className="hidden sm:grid grid-cols-3 gap-4 sm:gap-5">
          {badges.map((b, i) => (
            <BadgeCard key={b.name} badge={b} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BadgeCard({
  badge,
  index,
  className = "",
}: {
  badge: (typeof badges)[number];
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4, scale: 1.03 }}
      className={`glass-card p-5 flex flex-col items-center gap-3 text-center shadow-lg hover:shadow-2xl transition-all ${className}`}
    >
      <div
        className={`w-20 h-20 rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-inner border border-white/40 relative`}
        style={{ boxShadow: "inset 0 2px 6px hsl(0 0% 100% / 0.5), 0 6px 16px hsl(var(--primary) / 0.15)" }}
      >
        <span className="text-4xl drop-shadow-md">{badge.emoji}</span>
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/30 pointer-events-none" />
      </div>
      <h3 className="font-display font-bold text-sm sm:text-base text-foreground">{badge.name}</h3>
      <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
        {badge.curriculum}
      </span>
    </motion.div>
  );
}
