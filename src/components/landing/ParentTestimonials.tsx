import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";

const testimonials = [
  {
    name: "Sarah",
    location: "Sandton",
    quote: "My daughter's CAPS marks jumped from 65% to 82% in one term. The Owl explains things in a way her teacher's notes never did.",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    name: "Thabo",
    location: "Cape Town",
    quote: "Homework stress in our house is gone. The Owl is patient where I'm not!",
    span: "",
  },
  {
    name: "Priya",
    location: "Durban",
    quote: "Perfect for IEB Grade 5 — finally a tutor that explains instead of giving answers.",
    span: "",
  },
  {
    name: "James",
    location: "Pretoria",
    quote: "Cambridge-aligned and genuinely engaging. Worth every cent.",
    span: "",
  },
  {
    name: "Lebo",
    location: "Johannesburg",
    quote: "My son actually asks to do extra practice now. Unheard of!",
    span: "",
  },
];

export function ParentTestimonials() {
  return (
    <section className="px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Trusted by South African Families
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-lg">
            Real parents, real progress
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-3 sm:gap-4 auto-rows-fr">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card p-5 sm:p-6 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-xl transition-all ${t.span}`}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[hsl(var(--star-gold))] text-[hsl(var(--star-gold))]" />
                ))}
              </div>
              <p className={`text-foreground leading-relaxed font-medium ${t.featured ? "text-base sm:text-xl" : "text-sm"}`}>
                "{t.quote}"
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-white/30">
                <div>
                  <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">from {t.location}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/20">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
