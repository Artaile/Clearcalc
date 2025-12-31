"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface CalculatorLayoutProps {
    children: ReactNode;
    title: string;
    description: string;
}

export function CalculatorLayout({ children, title, description }: CalculatorLayoutProps) {
    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <header className="flex flex-col gap-4">
                <Link
                    href="/"
                    className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit"
                >
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>

                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
                    <p className="text-zinc-500">{description}</p>
                </div>
            </header>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
}
