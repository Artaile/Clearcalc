"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const NOTES = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

export default function CashCounter() {
    const [counts, setCounts] = useState<Record<number, string>>({});
    const [total, setTotal] = useState(0);

    const handleChange = (note: number, val: string) => {
        // Allow empty string or numbers
        if (val === "" || /^\d+$/.test(val)) {
            setCounts(prev => ({ ...prev, [note]: val }));
        }
    };

    useEffect(() => {
        let t = 0;
        NOTES.forEach(note => {
            const count = parseInt(counts[note] || "0", 10);
            if (!isNaN(count)) {
                t += note * count;
            }
        });
        setTotal(t);
    }, [counts]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <CalculatorLayout title="Cash Counter" description="Tally your cash denomination">
            <div className="flex flex-col gap-6 pb-20">
                {/* Sticky Total Display */}
                <div className="sticky top-4 z-20">
                    <div className="bg-[#09090b]/90 backdrop-blur-xl border border-orange-500/20 shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)] rounded-3xl p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-50" />
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">Total Cash</span>
                        <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-yellow-600 font-mono tracking-tight">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {NOTES.map((note) => {
                        const countVal = counts[note] || "";
                        const subtotal = (parseInt(countVal || "0", 10) || 0) * note;
                        const isActive = countVal !== "" && parseInt(countVal) > 0;

                        return (
                            <div key={note} className={`flex items-center gap-4 p-2 pr-4 rounded-2xl transition-all duration-200 ${isActive ? "bg-white/[0.03] border border-white/5" : "hover:bg-white/[0.01] border border-transparent"}`}>
                                {/* Denomination Badge */}
                                <div className="w-20 h-12 flex items-center justify-center bg-white/[0.05] rounded-xl border border-white/5 font-bold text-zinc-300 shadow-inner">
                                    ₹{note}
                                </div>

                                <span className="text-zinc-600 font-medium">×</span>

                                {/* Input Field */}
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    className="flex-1 h-12 bg-black/40 border border-white/10 rounded-xl text-center text-lg text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] focus:ring-2 focus:ring-white/5 transition-all"
                                    value={countVal}
                                    onChange={(e) => handleChange(note, e.target.value)}
                                />

                                <span className="text-zinc-600 font-medium">=</span>

                                {/* Subtotal Display */}
                                <div className={`w-28 text-right font-medium text-lg ${isActive ? "text-white" : "text-zinc-600"}`}>
                                    {subtotal.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </CalculatorLayout>
    );
}
