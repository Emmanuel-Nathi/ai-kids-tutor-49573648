import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { lazy, Suspense } from "react";
import { OwlMascot } from "@/components/OwlMascot";
import { MiniChatPreview } from "@/components/MiniChatPreview";

const OwlScene = lazy(() => import("@/components/OwlScene"));
import { Sparkles, Gift, LineChart, Camera, Shield, ArrowRight, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import TransparentLogo from "@/components/TransparentLogo";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { CookieConsent } from "@/components/CookieConsent";

const bentoFeatures = [
  {
    icon: Sparkles,
    title: "Socratic AI Guidance",
    desc: "Our AI never gives answers. It asks the right questions to build real understanding and problem-solving skills.",
    span: "md:col-span-2 md:row-span-2",
    large: true,
  },
  {
    icon: Gift,
    title: "Real-World Rewards",
    desc: "Kids earn points. Parents set custom rewards — screen time, treats, outings.",
    span: "",
    large: false,
  },
  {
    icon: LineChart,
    title: "Parent Analytics",
    desc: "See what your child studied, for how long, and full session transcripts.",
    span: "",
    large: false,
  },
  {
    icon: Camera,
    title: "Homework Scanning",
    desc: "Snap a photo of any worksheet and the AI walks your child through it.",
    span: "md:col-span-2",
    large: false,
  },
];

const trustBadges = [
  "CAPS Aligned",
  "IEB Aligned",
  "Cambridge Aligned",
];

const trustPoints = [
  { icon: Shield, text: "Age-appropriate, safe AI interactions" },
  { icon: Shield, text: "No ads, no data selling, no distractions" },
  { icon: Shield, text: "Works on any device — phone, tablet, or laptop" },
  { icon: Shield, text: "Built specifically for South African families" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const heroRef = useRef<HTMLElement>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/parent");
  }, [user, loading, navigate]);

  // Sticky mobile CTA visibility
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCTA(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCTA = () => {
    window.gtag?.("event", "begin_checkout", {
      items: [{ item_name: "AI Kids Tutor Subscription", price: 199.99, currency: "ZAR" }],
    });
    window.posthog?.capture("begin_checkout", { price: 199.99, currency: "ZAR" });
    navigate("/auth");
  };

  const { scrollY } = useScroll();
  const blob1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const blob2Y = useTransform(scrollY, [0, 1000], [0, -80]);
  const blob3Y = useTransform(scrollY, [0, 1000], [0, -200]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Organic background blobs with parallax */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: blob1Y }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl"
        />
        <motion.div
          style={{ y: blob2Y }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -left-48 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-3xl"
        />
        <motion.div
          style={{ y: blob3Y }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-primary/5 blur-3xl"
        />
      </div>

      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-50 px-2 sm:px-4 pt-2 sm:pt-3 pb-0">
        <div className="glass rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between max-w-6xl mx-auto">
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <TransparentLogo src={logo} alt="AI Kids Tutor" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" loading="lazy" />
            <span className="font-display font-bold text-sm sm:text-lg text-foreground">AI Kids Tutor</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full font-display text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => navigate("/child-login")}
            >
              <span className="hidden sm:inline">I'm a Kid 🎒</span>
              <span className="sm:hidden">Kid 🎒</span>
            </Button>
            <Button
              onClick={handleCTA}
              size="sm"
              className="rounded-full font-display text-xs sm:text-sm px-3 sm:px-4 bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-shadow"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-0 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto flex flex-col items-center w-full"
        >
          <div className="w-full max-w-[260px] sm:max-w-[320px] mx-auto mb-4">
            <Suspense fallback={<OwlMascot size="xl" trackMouse />}>
              <OwlScene equippedItems={{}} containerHeight={280} modelYOffset={0.3} />
            </Suspense>
          </div>

          <p className="text-base sm:text-lg md:text-xl font-display font-semibold text-foreground/80">
            Let's make homework fun! 🦉
          </p>

          {/* Trust badges right after mascot */}
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-display font-semibold bg-secondary/15 text-secondary border border-secondary/20"
              >
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {badge}
              </span>
            ))}
          </div>

          {/* Liquid Glass hero card */}
          <div className="mt-6 sm:mt-8 glass rounded-2xl sm:rounded-3xl px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14 text-center max-w-3xl w-full">
            <h1 className="font-display text-2xl sm:text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
              Stop fighting over{" "}
              <span className="text-primary">homework.</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              An AI tutor that uses the Socratic method to help your child actually
              <em> understand</em> their schoolwork — aligned to CAPS, IEB & Cambridge.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleCTA}
                size="lg"
                className="font-display text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Start my 30-day free trial
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-display text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full border-primary/20 hover:bg-primary/5"
                onClick={() => navigate("/child-login")}
              >
                I'm a Kid 🎒
              </Button>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
              No credit card required · Cancel anytime
            </p>
          </div>

          {/* Mini-chat preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 w-full flex justify-center"
          >
            <MiniChatPreview />
          </motion.div>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              How it works
            </h2>
            <p className="mt-2 text-muted-foreground text-sm sm:text-lg">
              Three pillars that make learning stick
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {bentoFeatures.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${item.span}`}
              >
                <div className={`rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-inner ${item.large ? "w-14 h-14 sm:w-16 sm:h-16" : "w-10 h-10 sm:w-12 sm:h-12"}`}>
                  <item.icon className={`text-primary ${item.large ? "w-7 h-7 sm:w-8 sm:h-8" : "w-5 h-5 sm:w-6 sm:h-6"}`} />
                </div>
                <h3 className={`font-display font-bold text-foreground ${item.large ? "text-lg sm:text-xl" : "text-base sm:text-lg"}`}>
                  {item.title}
                </h3>
                <p className={`text-muted-foreground leading-relaxed ${item.large ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Points */}
      <section className="px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center">
              Built for South African families
            </h2>
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {trustPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-3 sm:p-4 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0">
                    <point.icon className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-foreground font-medium text-xs sm:text-sm">{point.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Simple pricing
            </h2>
            <div className="mt-6 sm:mt-8 glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-primary/20 shadow-xl">
              <p className="text-sm font-display font-semibold text-primary uppercase tracking-wide">
                Full Access
              </p>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  R199.99
                </span>
                <span className="text-muted-foreground text-sm sm:text-base">/month</span>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">
                Free for 30 days — no credit card needed
              </p>
              <Button
                onClick={handleCTA}
                size="lg"
                className="mt-6 w-full font-display text-base sm:text-lg rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Yes! Give me my free trial
              </Button>
              <ul className="mt-6 space-y-2 text-xs sm:text-sm text-muted-foreground text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" /> Unlimited AI tutoring sessions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" /> All curricula included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" /> Parent dashboard & analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" /> Homework photo scanning
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 sm:py-6 pb-16 sm:pb-6 text-xs text-muted-foreground border-t border-border flex items-center justify-center gap-4">
        <span>© 2026 AI Kids Tutor. Safe learning for every child.</span>
        <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate("/admin")}>Admin</span>
      </footer>

      {/* Sticky Mobile CTA */}
      <motion.div
        initial={false}
        animate={{ y: showStickyCTA ? 0 : 100, opacity: showStickyCTA ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden"
      >
        <Button
          onClick={handleCTA}
          size="lg"
          className="w-full font-display text-base rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-xl"
        >
          Start my free trial
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>

      <CookieConsent />
    </div>
  );
}
