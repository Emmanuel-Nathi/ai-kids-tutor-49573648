import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OwlMascot } from "@/components/OwlMascot";
import { BookOpen, Shield, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const features = [
  { icon: BookOpen, title: "Cambridge Aligned", desc: "Curriculum-strict tutoring" },
  { icon: Shield, title: "Parent Supervised", desc: "Full session visibility" },
  { icon: Star, title: "Gamified Learning", desc: "Points & rewards system" },
  { icon: Zap, title: "AI Powered", desc: "Socratic teaching method" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/parent");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/favicon.ico" alt="" className="w-8 h-8" />
          <span className="font-display font-bold text-lg text-foreground">AI Kids Tutor</span>
        </div>
        <Button onClick={() => navigate("/auth")} size="sm">Get Started</Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <OwlMascot size="xl" message="Let's learn together! 🦉" />
          <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Your Child's <span className="text-primary">Smart Study Buddy</span>
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-md mx-auto">
            AI-powered homework help aligned to the Cambridge curriculum. Parents stay in control.
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" className="mt-6 font-display text-lg px-8">
            Start Learning Free
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-sm"
            >
              <f.icon className="w-8 h-8 text-primary" />
              <span className="font-display font-semibold text-sm text-foreground">{f.title}</span>
              <span className="text-xs text-muted-foreground text-center">{f.desc}</span>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        © 2026 AI Kids Tutor. Safe learning for every child.
      </footer>
    </div>
  );
}
