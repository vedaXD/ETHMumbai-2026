'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import Hyperspeed from "@/components/shared/Hyperspeed";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { UserEnsBadge } from "@/components/shared/user-ens-badge";
import { useWallet } from "@/lib/WalletContext";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { address, connecting, connect, disconnect } = useWallet();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <div className="relative min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0 opacity-100 mix-blend-screen pointer-events-none">
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
        className="relative border-b border-white/5 bg-black/10 backdrop-blur-lg z-50 flex-shrink-0"
      >
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-semibold text-white">OctoHive</span>
            </Link>

            <div className="flex items-center space-x-4">
              {pathname !== '/dashboard' && (
                <Link href="/dashboard" className="text-white/50 hover:text-white text-xs font-medium transition-colors">
                  Hub
                </Link>
              )}
              <Link href="/ens" className={`text-xs font-medium transition-colors ${pathname === '/ens' ? 'text-violet-400' : 'text-white/50 hover:text-violet-400'}`}>
                ENS Identity
              </Link>
              <UserEnsBadge address={address} />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
}
