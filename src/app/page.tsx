"use client";

import { Card } from "@/components/ui/Card";
import {
  Calculator,
  Percent,
  HandCoins,
  Gem,
  Library,
  Languages,
  Ruler,
  TrendingUp,
  CreditCard,
  Target,
  UserCircle,
  BarChart3,
  CalendarDays,
  ArrowRight
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

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 mt-8 sm:mt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          More than 15+ Advanced Tools
        </motion.div>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-2xl leading-[1.1]">
            Precise tools for your <span className="text-zinc-500 font-normal italic">financial future.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto">
            Discover simple and powerful tools designed to help you calculate, compare, and save more.
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <div className="flex flex-col gap-24 mb-16">
        {categories.map((cat, idx) => (
          <section key={cat.title} className="flex flex-col gap-8">
            <div className="flex flex-col gap-1 px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-8 h-[2px] bg-white/10" />
                {cat.title}
              </h2>
              <p className="text-zinc-500 text-sm ml-11">{cat.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {cat.items.map((item, i) => (
                <Link href={item.href} key={item.title}>
                  <Card className="p-6 flex items-start gap-4 group">
                    <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-lg tracking-tight">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-sm leading-snug">{item.desc}</p>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 group-hover:text-white mt-4 transition-colors">
                        Launch Tool
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="text-center py-12 border-t border-white/5">
        <p className="text-zinc-600 text-sm">
          Crafted with precision. Powered by ClearCalc.
        </p>
      </footer>
    </div>
  );
}
