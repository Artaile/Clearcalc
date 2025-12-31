"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { constructPrompt, generateInsight } from "@/lib/ai";
import { Lightbulb, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfitLossCalculator() {
    const [costPrice, setCostPrice] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [result, setResult] = useState<{ amount: number, percentage: number, type: "profit" | "loss" | "break-even" } | null>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async () => {
        if (!costPrice || !sellingPrice) return;

        const cp = parseFloat(costPrice);
        const sp = parseFloat(sellingPrice);

        const diff = sp - cp;
        const percentage = (Math.abs(diff) / cp) * 100;

        let type: "profit" | "loss" | "break-even" = "break-even";
        if (diff > 0) type = "profit";
        if (diff < 0) type = "loss";

        setResult({ amount: Math.abs(diff), percentage, type });

        // AI Insight
        setLoading(true);
        setInsight(null);
        const prompt = constructPrompt(
            "Profit/Loss Calculator",
            { CostPrice: cp, SellingPrice: sp },
            {
                ResultType: type.toUpperCase(),
                Amount: Math.abs(diff).toFixed(2),
                Percentage: percentage.toFixed(2) + "%"
            }
        );

        const aiResult = await generateInsight(prompt);
        setInsight(aiResult);
        setLoading(false);
    };

    const currencyFormatter = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(val);

    return (
        <CalculatorLayout title="Profit & Loss" description="Calculate detailed margins and ROI">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <Input
                        label="Cost Price (₹)"
                        type="number"
                        placeholder="e.g. 500"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                    />
                    <Input
                        label="Selling Price (₹)"
                        type="number"
                        placeholder="e.g. 650"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                    />

                    <Button onClick={calculate} className="mt-2 text-lg bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
                        Calculate Result
                    </Button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <Card className={cn(
                                    "border flex flex-col items-center justify-center py-4 gap-1 p-3",
                                    result.type === "profit" ? "bg-green-500/10 border-green-500/20" :
                                        result.type === "loss" ? "bg-red-500/10 border-red-500/20" :
                                            "bg-white/5 border-white/10"
                                )}>
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">
                                        {result.type === "profit" ? "Total Profit" : result.type === "loss" ? "Total Loss" : "No Profit/Loss"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {result.type === "profit" && <TrendingUp className="w-5 h-5 text-green-400" />}
                                        {result.type === "loss" && <TrendingDown className="w-5 h-5 text-red-400" />}
                                        <span className={cn(
                                            "text-xl font-bold",
                                            result.type === "profit" ? "text-green-400" :
                                                result.type === "loss" ? "text-red-400" : "text-white"
                                        )}>
                                            {currencyFormatter(result.amount)}
                                        </span>
                                    </div>
                                </Card>

                                <Card className="bg-white/5 border-white/10 flex flex-col items-center justify-center py-4 gap-1 p-3">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Percentage</span>
                                    <span className={cn(
                                        "text-xl font-bold",
                                        result.type === "profit" ? "text-green-400" :
                                            result.type === "loss" ? "text-red-400" : "text-zinc-300"
                                    )}>
                                        {result.percentage.toFixed(2)}%
                                    </span>
                                </Card>
                            </div>

                            {/* AI Insight Card */}
                            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-full mt-1">
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                        ) : (
                                            <Lightbulb className="w-5 h-5 text-indigo-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Insight</span>
                                        {loading ? (
                                            <p className="text-zinc-500 text-sm animate-pulse">Analyzing margins...</p>
                                        ) : (
                                            <p className="text-zinc-300 text-sm leading-relaxed">
                                                {insight || "Calculating insights..."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CalculatorLayout>
    );
}
