"use client";

import { Card } from "@/components/ui/Card";
import {
  Calculator,
  Percent,
  HandCoins,
  Gem,
  Languages,
  Ruler,
  CreditCard,
  Target,
  UserCircle,
  BarChart3,
  CalendarDays,
  ArrowRight,
  Scale
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    title: "Finance & Loans",
    description: "Plan your debt and savings efficiently.",
    items: [
      {
        title: "EMI Calculator",
        desc: "Calculate monthly loan payments",
        icon: Calculator,
        href: "/emi",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        badge: "Popular"
      },
      {
        title: "Loan Eligibility",
        desc: "Check your maximum loan limit",
        icon: UserCircle,
        href: "/eligibility",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        badge: "New"
      },
      {
        title: "Compare Loans",
        desc: "Find the best loan offer",
        icon: BarChart3,
        href: "/compare-loans",
        color: "text-amber-400",
        bg: "bg-amber-500/10"
      },
      {
        title: "Loan Profiles",
        desc: "Save and track your loans",
        icon: CalendarDays,
        href: "/profiles",
        color: "text-violet-400",
        bg: "bg-violet-500/10"
      },
    ]
  },
  {
    title: "Tax & Business",
    description: "Manage your business and taxes.",
    items: [
      {
        title: "GST & VAT",
        desc: "Calculate inclusive/exclusive tax",
        icon: HandCoins,
        href: "/gst",
        color: "text-rose-400",
        bg: "bg-rose-500/10"
      },
      {
        title: "Profit / Loss",
        desc: "Calculate business margins",
        icon: Target,
        href: "/profit",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10"
      },
      {
        title: "Discount",
        desc: "Calculate final sale price",
        icon: Percent,
        href: "/discount",
        color: "text-pink-400",
        bg: "bg-pink-500/10"
      },
    ]
  },
  {
    title: "Banking & Utils",
    description: "Quick tools for everyday banking.",
    items: [
      {
        title: "Banking Tools",
        desc: "FD, RD, SI & Compound interest",
        icon: Gem,
        href: "/banking",
        color: "text-blue-400",
        bg: "bg-blue-500/10"
      },
      {
        title: "Gold Purchase",
        desc: "Price breakdown with tax & wastage",
        icon: Scale,
        href: "/gold",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        badge: "New"
      },
      {
        title: "Cash Counter",
        desc: "Total cash and denominations",
        icon: CreditCard,
        href: "/cash",
        color: "text-orange-400",
        bg: "bg-orange-500/10"
      },
      {
        title: "Currency",
        desc: "Real-time exchange rates",
        icon: Languages,
        href: "/currency",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10"
      },
      {
        title: "Unit Converter",
        desc: "Convert area, speed & temp",
        icon: Ruler,
        href: "/units",
        color: "text-teal-400",
        bg: "bg-teal-500/10"
      },
    ]
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col gap-16">
      {/* Background Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-8 mt-12 sm:mt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500" />
          <div className="relative px-4 py-1.5 rounded-full bg-zinc-900 ring-1 ring-white/10 text-xs font-medium text-zinc-400 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            More than 15+ Advanced Tools
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-4 max-w-3xl"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Precise tools for your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-semibold italic">
              financial future.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover simple and powerful tools designed to help you calculate, compare, and save more.
            All in one place.
          </p>
        </motion.div>
      </section>

      {/* Grid Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-16 sm:gap-24 mb-24"
      >
        {categories.map((cat, idx) => (
          <section key={cat.title} className="flex flex-col gap-6 sm:gap-8">
            <motion.div variants={item} className="flex flex-col gap-2 px-2 border-l-2 border-indigo-500/50 pl-4 sm:pl-6 ml-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {cat.title}
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm font-medium">{cat.description}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
              {cat.items.map((navItem) => (
                <motion.div variants={item} key={navItem.title}>
                  <Link href={navItem.href} className="block h-full">
                    <Card className="h-full p-5 sm:p-6 flex flex-row items-start gap-4 sm:gap-6 group hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                      <div className={`p-3 sm:p-4 rounded-2xl ${navItem.bg} ${navItem.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shrink-0`}>
                        <navItem.icon className="w-6 h-6 sm:w-6 sm:h-6" />
                      </div>

                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-white text-base sm:text-lg tracking-tight group-hover:text-indigo-300 transition-colors">{navItem.title}</span>
                          {navItem.badge && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white shadow-sm whitespace-nowrap">
                              {navItem.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">{navItem.desc}</p>

                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 group-hover:text-indigo-400 mt-auto pt-2 sm:pt-4 transition-colors">
                          Launch Tool
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Hover Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </motion.div>

      <footer className="text-center py-12 border-t border-white/10 mt-auto">
        <div className="flex flex-col gap-4 items-center">
          <p className="text-zinc-500 text-sm">
            Crafted with precision. Powered by <span className="text-white font-medium">ClearCalc</span>.
          </p>
          <div className="flex gap-4 text-xs text-zinc-600">
            <span>© {new Date().getFullYear()} ClearCalc</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
