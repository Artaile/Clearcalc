"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    ReceiptText,
    Percent,
    Calculator,
    ArrowRight,
    Landmark,
    Coins
} from "lucide-react";

const GST_RATES = [
    { label: "3% (Gold)", value: "3" },
    { label: "5% (Essentials)", value: "5" },
    { label: "12% (Standard)", value: "12" },
    { label: "18% (Services)", value: "18" },
    { label: "28% (Luxury)", value: "28" },
];

const VAT_RATES = [
    { label: "5%", value: "5" },
    { label: "10%", value: "10" },
    { label: "12.5%", value: "12.5" },
    { label: "15%", value: "15" },
    { label: "20%", value: "20" },
];

export default function GSTCalculator() {
    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("18"); // Default to 18 for GST
    const [calcType, setCalcType] = useState("exclusive"); // exclusive or inclusive
    const [taxType, setTaxType] = useState<"GST" | "VAT">("GST");
    const [result, setResult] = useState<{ net: number, tax: number, total: number } | null>(null);

    const calculate = () => {
        if (!amount) return;

        const p = parseFloat(amount.replace(/,/g, ""));
        const r = parseFloat(rate);

        if (isNaN(p) || isNaN(r)) return;

        let taxAmount = 0;
        let totalAmount = 0;
        let netAmount = 0;

        if (calcType === "exclusive") {
            taxAmount = (p * r) / 100;
            totalAmount = p + taxAmount;
            netAmount = p;
        } else {
            // Inclusive: Tax = Total * (Rate / (100 + Rate))
            // Net = Total - Tax
            taxAmount = p - (p * (100 / (100 + r)));
            netAmount = p - taxAmount;
            totalAmount = p;
        }

        setResult({ net: netAmount, tax: taxAmount, total: totalAmount });
    };

    const currencyFormatter = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

    return (
        <CalculatorLayout title="GST & VAT Calculator" description="Calculate Exclusive or Inclusive Tax">
            <div className="flex flex-col gap-8">

                {/* Tax Type Tabs */}
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 scrollbar-hide no-scrollbar snap-x z-30 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <button
                        onClick={() => { setTaxType("GST"); setRate("18"); setResult(null); }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border snap-center whitespace-nowrap",
                            taxType === "GST"
                                ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"
                                : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white"
                        )}
                    >
                        <Landmark className="w-4 h-4" />
                        GST
                    </button>
                    <button
                        onClick={() => { setTaxType("VAT"); setRate("5"); setResult(null); }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border snap-center whitespace-nowrap",
                            taxType === "VAT"
                                ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"
                                : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white"
                        )}
                    >
                        <Coins className="w-4 h-4" />
                        VAT
                    </button>
                </div>

                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                        <Input
                            label="Amount (₹)"
                            type="number"
                            placeholder="e.g. 1,00,000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col gap-2">
                                <SearchableSelect
                                    label={`${taxType} Rate (%)`}
                                    options={taxType === "GST" ? GST_RATES : VAT_RATES}
                                    value={rate}
                                    onChange={setRate}
                                />
                            </div>

                            {/* Calc Type Segment Control */}
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">Calculation Type</label>
                                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 h-14 items-center w-full">
                                    <button
                                        onClick={() => setCalcType("exclusive")}
                                        className={cn(
                                            "flex-1 rounded-xl text-sm font-medium transition-all h-full",
                                            calcType === "exclusive"
                                                ? "bg-white/10 text-white shadow-sm border border-white/5"
                                                : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        Tax Exclusive
                                    </button>
                                    <button
                                        onClick={() => setCalcType("inclusive")}
                                        className={cn(
                                            "flex-1 rounded-xl text-sm font-medium transition-all h-full",
                                            calcType === "inclusive"
                                                ? "bg-white/10 text-white shadow-sm border border-white/5"
                                                : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        Tax Inclusive
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={calculate}
                            className="w-full h-14 mt-2 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20"
                        >
                            Calculate {taxType}
                            <ArrowRight className="w-5 h-5 ml-2" />
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
                                <div className="flex flex-col gap-4 bg-[#09090b] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                                    {/* Background Glow */}
                                    <div className="absolute top-0 right-0 p-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                    {/* Invoice Header */}
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 rounded-xl">
                                                <ReceiptText className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-zinc-400 text-xs uppercase tracking-wider">Tax Breakdown</span>
                                                <span className="text-white font-medium">{calcType === "exclusive" ? "Tax Added" : "Tax Included"}</span>
                                            </div>
                                        </div>
                                        <Card className="px-3 py-1 bg-white/5 border-white/10 text-xs text-zinc-400">
                                            {rate}% Rate
                                        </Card>
                                    </div>

                                    {/* Line Items */}
                                    <div className="flex flex-col gap-3 relative z-10">
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-zinc-400">Net Amount</span>
                                            <span className="text-lg font-medium text-white">
                                                {currencyFormatter(result.net)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 bg-amber-500/5 py-3 rounded-xl border border-amber-500/10">
                                            <span className="text-amber-200/70 text-sm flex items-center gap-2">
                                                <Percent className="w-3 h-3" />
                                                {taxType} Amount
                                            </span>
                                            <span className="text-lg font-bold text-amber-400">
                                                + {currencyFormatter(result.tax)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                                    {/* Total */}
                                    <div className="flex items-center justify-between px-2 relative z-10">
                                        <span className="text-zinc-300 font-medium">Total Payable</span>
                                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                                            {currencyFormatter(result.total)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CalculatorLayout>
    );
}
