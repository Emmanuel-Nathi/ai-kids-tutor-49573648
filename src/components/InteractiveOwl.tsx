import { motion, useAnimation } from "framer-motion";
import owlMascot from "@/assets/owl-mascot.png";

interface InteractiveOwlProps {
  variant: "hero" | "content";
}

const InteractiveOwl = ({ variant }: InteractiveOwlProps) => {
  const controls = useAnimation();

  const handleInteraction = async () => {
    await controls.start({
      rotate: [0, -15, 15, -10, 10, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.6 },
    });
  };

  const placementClasses =
    variant === "hero"
      ? "top-2 right-2 w-12 md:top-24 md:right-10 md:w-28 lg:top-32 lg:right-24 lg:w-36"
      : "bottom-24 left-2 w-12 md:bottom-20 md:left-10 md:w-24 lg:bottom-32 lg:left-24 lg:w-32";

  return (
    <motion.div
      animate={controls}
      onTap={handleInteraction}
      whileHover={{ scale: 1.05 }}
      className={`absolute z-40 cursor-pointer pointer-events-auto ${placementClasses}`}
    >
      <img
        src={owlMascot}
        alt="Socratic Owl mascot"
        loading="lazy"
        draggable={false}
        className="w-full h-auto drop-shadow-2xl select-none"
      />
    </motion.div>
  );
};

export default InteractiveOwl;
