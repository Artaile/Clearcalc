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
        setCounts(prev => ({ ...prev, [note]: val }));
    };

    useEffect(() => {
        let t = 0;
        NOTES.forEach(note => {
            const count = parseInt(counts[note] || "0");
            if (!isNaN(count)) {
                t += note * count;
            }
        });
        setTotal(t);
    }, [counts]);

    return (
        <CalculatorLayout title="Cash Counter" description="Tally your cash denomination">
            <div className="flex flex-col gap-6 pb-20">
                <Card className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-orange-500/20 shadow-orange-500/10">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-zinc-400 text-xs uppercase tracking-widest">Total Cash</span>
                        <span className="text-4xl font-bold text-orange-400">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(total)}
                        </span>
                    </div>
                </Card>

                <div className="grid gap-3">
                    {NOTES.map((note) => (
                        <div key={note} className="flex items-center gap-4">
                            <div className="w-16 h-10 flex items-center justify-center bg-white/5 rounded-md font-bold text-zinc-300">
                                ₹{note}
                            </div>
                            <span className="text-zinc-500">x</span>
                            <Input
                                placeholder="0"
                                type="number"
                                className="h-10 text-center"
                                value={counts[note] || ""}
                                onChange={(e) => handleChange(note, e.target.value)}
                            />
                            <span className="text-zinc-500">=</span>
                            <div className="w-24 text-right font-medium text-white">
                                {((parseInt(counts[note] || "0") || 0) * note).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CalculatorLayout>
    );
}
