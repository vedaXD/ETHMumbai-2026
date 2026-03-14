"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hyperspeed from "@/components/shared/Hyperspeed";
import SplashScreen from "@/components/shared/SplashScreen";
import { ArrowRight, Bot } from "lucide-react";

const ROTATING_WORDS = ["autonomous.", "on-chain.", "peer-to-peer.", "gasless."];

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    const lightsContainer = document.getElementById("lights");
    if (lightsContainer) {
      lightsContainer.dispatchEvent(new MouseEvent("mousedown"));
    }
    setTimeout(() => {
      router.push("/payment");
    }, 1200);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0 opacity-100 mix-blend-screen">
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => {},
            onSlowDown: () => {},
            distortion: "mountainDistortion",
            length: 400,
            roadWidth: 9,
            islandWidth: 2,
            lanesPerRoad: 3,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 3,
            carLightsFade: 0.4,
            totalSideLightSticks: 50,
            lightPairsPerRoadWay: 50,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [20, 60],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.2, 0.2],
            carFloorSeparation: [0.05, 1],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0x131318,
              brokenLines: 0x131318,
              leftCars: [0xff0000, 0xff3333, 0xff0000],
              rightCars: [0xffffff, 0xeeeeee, 0xdddddd],
              sticks: 0xffffff,
            },
          }}
        />
      </div>

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 w-full border-b border-white/5 bg-black/10 backdrop-blur-lg z-50"
      >
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-semibold text-white">Claw2Claw</span>
            </Link>
            <button className="px-5 py-1.5 bg-white/10 border border-white/10 text-white text-xs font-medium rounded-full hover:bg-white hover:text-black transition-all duration-200">
              Connect Wallet
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <motion.div
        className="container relative z-10 px-6 flex flex-col items-center text-center space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h1
          className="text-[48px] md:text-[68px] font-bold tracking-tight text-white max-w-5xl leading-[1.2]"
        >
          Agentic trading,{" "}
          <span className="inline-grid [grid-template-areas:'content'] relative h-[1.2em] w-auto text-left align-bottom">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={ROTATING_WORDS[wordIndex]}
                initial={{ y: 25, opacity: 0, rotateX: -60 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                exit={{ y: -25, opacity: 0, rotateX: 60 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 15 }}
                className="[grid-area:content] relative inline-block text-white pb-3 origin-bottom text-[52px] md:text-[72px]"
              >
                <span className="relative z-10 block pr-2">{ROTATING_WORDS[wordIndex]}</span>
                <svg className="absolute w-full h-[14px] bottom-1 left-0 z-0 text-red-500 drop-shadow-lg" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 6 Q 50 12 100 2" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" />
                </svg>
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <AnimatePresence mode="wait">
          <motion.div 
            key="buttons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-row gap-4 pt-2"
          >
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 text-base font-medium text-black transition-all hover:bg-white/90 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <span className="mr-2">Launch App</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
            >
              View Docs
            </Link>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* How It Works Section */}
      <div id="how-it-works" className="absolute bottom-6 w-full z-10 pointer-events-none">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-5 pointer-events-auto">
            <div className="grid grid-cols-4 gap-6 text-center">
              {[
                { emoji: "🤖", text: "AI Strategies" },
                { emoji: "🔗", text: "On-Chain" },
                { emoji: "🤝", text: "P2P Trades" },
                { emoji: "⚡", text: "Zero Gas" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer">
                  <span className="text-base grayscale brightness-200">{item.emoji}</span>
                  <p className="text-xs text-zinc-400 font-light">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
