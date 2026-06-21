"use client";

import { motion } from "framer-motion";
import { Aperture, Sparkles, ChevronDown } from "lucide-react";

interface HeroProps {
  ready: boolean;
}

export default function Hero({ ready }: HeroProps) {
  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Animated Ambient Backdrop Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <motion.div
          className="absolute h-[60vh] w-[60vh] rounded-full bg-gold/[0.06] blur-[120px]"
          animate={ready ? {
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          } : {}}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Subtitle with Icons */}
      <motion.div
        className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-[0.35em] text-gold/80 uppercase mb-5 sm:mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <Aperture className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span>Visual Architect</span>
        <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
      </motion.div>

      {/* Main Title with Cinematic Blur Reveal */}
      <div className="overflow-hidden py-2 relative">
        <motion.h1
          className="font-display text-[22vw] sm:text-[14vw] md:text-[10rem] leading-[0.85] tracking-tighter text-bone drop-shadow-lg"
          initial={{ y: "100%", filter: "blur(12px)" }}
          animate={ready ? { y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          SARA<span className="text-gold"></span>
        </motion.h1>
      </div>

      {/* Cinematic Description */}
      <motion.p
        className="mt-6 sm:mt-8 max-w-xl font-body text-[14.5px] sm:text-[16px] md:text-[17px] text-bone-dim leading-[1.8] tracking-wide"
        initial={{ opacity: 0, y: 15 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        Visual storytelling through cinematic stills. <br className="hidden sm:block" />
        A digital gallery of fleeting moments and captured light.
      </motion.p>

      {/* Animated Scroll Indicator positioned at the bottom */}
      <motion.div
        className="absolute bottom-10 sm:bottom-12 flex flex-col items-center gap-3 font-mono text-[10px] sm:text-[11px] tracking-widest text-grey/70"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <span className="uppercase tracking-[0.2em]">Explore The Archive</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-gold/70" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </section>
  );
}