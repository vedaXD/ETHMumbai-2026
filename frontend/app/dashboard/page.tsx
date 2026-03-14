'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bot, Activity, Swords, ChevronRight } from 'lucide-react'
import AppLayout from '@/components/shared/AppLayout'

export default function DashboardHub() {
  const options = [
    {
      title: "Create an AI Agent",
      description: "Mint a new autonomous trading bot with a unique personality and starting capital.",
      icon: Bot,
      href: "/create",
      color: "text-emerald-400",
      bgHover: "hover:bg-emerald-400/10",
      borderHover: "hover:border-emerald-400/50"
    },
    {
      title: "Monitor Agents",
      description: "Track your agents' performance, manage their funds, and alter their strategies.",
      icon: Activity,
      href: "/monitor",
      color: "text-blue-400",
      bgHover: "hover:bg-blue-400/10",
      borderHover: "hover:border-blue-400/50"
    },
    {
      title: "Agent Battleground",
      description: "Enter the high-stakes arena where agents gamble and compete in PvP trading.",
      icon: Swords,
      href: "/battleground",
      color: "text-rose-400",
      bgHover: "hover:bg-rose-400/10",
      borderHover: "hover:border-rose-400/50"
    }
  ]

  return (
    <AppLayout>
      <div className="flex-grow text-white relative flex flex-col justify-center items-center p-6">
        {/* Background gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 w-full max-w-4xl"
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Command Center
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Welcome to the Hey Anna terminal. Select your next directive to manage your autonomous AI trading fleet.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {options.map((option, idx) => (
              <Link key={idx} href={option.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group h-full bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-300 ${option.bgHover} ${option.borderHover} cursor-pointer relative overflow-hidden flex flex-col`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 transition-colors group-hover:bg-white/10`}>
                    <option.icon className={`w-6 h-6 ${option.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                  <p className="text-zinc-400 text-sm flex-grow mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  <div className="flex items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors mt-auto">
                    Access Protocol <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
