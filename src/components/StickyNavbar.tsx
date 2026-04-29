import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TransparentLogo from "@/components/TransparentLogo";
import logo from "@/assets/logo.png";

const StickyNavbar = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // useMotionValueEvent tracks scroll outside React's render path for smooth perf.
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const handleCTA = () => {
    window.gtag?.("event", "begin_checkout", {
      items: [{ item_name: "AI Kids Tutor Subscription", price: 199.99, currency: "ZAR" }],
    });
    window.posthog?.capture("begin_checkout", { price: 199.99, currency: "ZAR" });
    navigate("/auth");
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <TransparentLogo
          src={logo}
          alt="AI Kids Tutor"
          className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
          loading="lazy"
        />
        <span className="font-display font-bold text-sm sm:text-lg text-foreground">
          AI Kids Tutor
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex rounded-full font-display text-sm"
          onClick={() => navigate("/child-login")}
        >
          I'm a Kid 🎒
        </Button>

        <Button
          onClick={handleCTA}
          size="sm"
          className="rounded-full font-display text-xs sm:text-sm px-4 sm:px-6 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Start Free Trial
        </Button>
      </div>
    </motion.nav>
  );
};

export default StickyNavbar;
