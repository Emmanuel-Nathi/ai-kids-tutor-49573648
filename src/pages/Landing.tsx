import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { Sparkles, Gift, LineChart, CheckCircle, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";
import TransparentLogo from "@/components/TransparentLogo";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { CookieConsent } from "@/components/CookieConsent";

const howItWorks = [
  {
    icon: Sparkles,
    title: "Socratic AI Guidance",
    desc: "Our AI never gives answers. It asks the right questions to guide your child to understand concepts deeply — building real problem-solving skills.",
  },
  {
    icon: Gift,
    title: "Real-World Rewards",
    desc: "Children earn points for every learning session. Parents set custom rewards — screen time, treats, outings — that motivate consistent study habits.",
  },
  {
    icon: LineChart,
    title: "Parent Analytics",
    desc: "See exactly what your child studied, for how long, and how well they're progressing. Full session transcripts give you total visibility.",
  },
];

const trustPoints = [
  "Aligned to CAPS, IEB & Cambridge curricula",
  "Age-appropriate, safe AI interactions",
  "No ads, no data selling, no distractions",
  "Works on any device — phone, tablet, or laptop",
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/parent");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <TransparentLogo src={logo} alt="AI Kids Tutor" className="w-8 h-8 object-contain" />
          <span className="font-display font-bold text-lg text-foreground">AI Kids Tutor</span>
        </div>
        <Button onClick={() => navigate("/auth")} size="sm">
          Get Started
        </Button>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <OwlMascot size="xl" message="Let's make homework fun! 🦉" />
          <h1 className="mt-8 font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Stop fighting over{" "}
            <span className="text-primary">homework.</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            An AI tutor that uses the Socratic method to help your child actually
            <em> understand</em> their schoolwork — aligned to CAPS, IEB & Cambridge.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                window.gtag?.('event', 'begin_checkout', {
                  items: [{ item_name: 'AI Kids Tutor Subscription', price: 199.99, currency: 'ZAR' }],
                });
                window.posthog?.capture('begin_checkout', { price: 199.99, currency: 'ZAR' });
                navigate("/auth");
              }}
              size="lg"
              className="font-display text-lg px-8 py-6"
            >
              Start your 30-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            No credit card required • Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="px-6 py-16 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              How it works
            </h2>
            <p className="mt-2 text-muted-foreground text-lg">
              Three pillars that make learning stick
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Points */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Built for South African families
            </h2>
            <div className="mt-8 grid sm:grid-cols-2 gap-4 text-left">
              {trustPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-foreground font-medium">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 bg-card border-y border-border">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Simple pricing
            </h2>
            <Card className="mt-8 border-primary/30 shadow-lg">
              <CardContent className="p-8">
                <p className="text-sm font-display font-semibold text-primary uppercase tracking-wide">
                  Full Access
                </p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="font-display text-5xl font-bold text-foreground">R199.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Free for 30 days — no credit card needed
                </p>
                <Button
                  onClick={() => {
                    window.gtag?.('event', 'begin_checkout', {
                      items: [{ item_name: 'AI Kids Tutor Subscription', price: 199.99, currency: 'ZAR' }],
                    });
                    window.posthog?.capture('begin_checkout', { price: 199.99, currency: 'ZAR' });
                    navigate("/auth");
                  }}
                  size="lg"
                  className="mt-6 w-full font-display text-lg"
                >
                  Start Free Trial
                </Button>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" /> Unlimited AI tutoring sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" /> All curricula included
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" /> Parent dashboard & analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" /> Homework photo scanning
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border flex items-center justify-center gap-4">
        <span>© 2026 AI Kids Tutor. Safe learning for every child.</span>
        <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate("/admin")}>Admin</span>
      </footer>

      <CookieConsent />
    </div>
  );
}
