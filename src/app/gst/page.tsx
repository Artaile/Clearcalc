"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GSTCalculator() {
    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("18"); // Default to 18 for GST, user can change
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
            taxAmount = p - (p * (100 / (100 + r)));
            netAmount = p - taxAmount;
            totalAmount = p;
        }

        setResult({ net: netAmount, tax: taxAmount, total: totalAmount });
    };

    const currencyFormatter = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

    return (
        <CalculatorLayout title="GST & VAT Calculator" description="Calculate Exclusive / Inclusive Tax">
            <div className="flex flex-col gap-6">

                {/* Tax Type Toggle */}
                <div className="flex p-1 bg-black/20 rounded-xl">
                    <button
                        onClick={() => { setTaxType("GST"); setResult(null); }}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                            taxType === "GST" ? "bg-primary text-black shadow-lg" : "text-zinc-400 hover:text-white"
                        )}
                    >
                        GST
                    </button>
                    <button
                        onClick={() => { setTaxType("VAT"); setResult(null); }}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                            taxType === "VAT" ? "bg-primary text-black shadow-lg" : "text-zinc-400 hover:text-white"
                        )}
                    >
                        VAT
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <Input
                        label="Amount (₹)"
                        type="text" // changed to text for formatted display if needed, but Input component handles it
                        placeholder="e.g. 1,00,000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            {/* Custom rate input for flexibility, or keep Select with common rates */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">{taxType} Rate (%)</label>
                                <select
                                    className="flex h-12 w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                >
                                    {taxType === "GST" ? (
                                        <>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="5">5%</option>
                                            <option value="10">10%</option>
                                            <option value="12.5">12.5%</option>
                                            <option value="15">15%</option>
                                            <option value="20">20%</option>
                                        </>
                                    )}
                                    {/* Option to add custom value could be handled by a separate input if needed, but keeping it simple for now */}
                                </select>
                            </div>
                        </div>
                        <div className="flex-1">
                            <Select
                                label="Calculation Type"
                                value={calcType}
                                onChange={(e) => setCalcType(e.target.value)}
                                options={[
                                    { label: `${taxType} Exclusive`, value: "exclusive" },
                                    { label: `${taxType} Inclusive`, value: "inclusive" },
                                ]}
                            />
                        </div>
                    </div>

                    <Button onClick={calculate} className="mt-2 text-lg">
                        Calculate {taxType}
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
                            <Card className="bg-primary/10 border-primary/20 flex flex-col py-6 gap-4">
                                <div className="flex items-center justify-between px-6">
                                    <span className="text-zinc-400">Net Amount</span>
                                    <span className="text-xl font-bold text-white">
                                        {currencyFormatter(result.net)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-6">
                                    <span className="text-zinc-400">{taxType} ({rate}%)</span>
                                    <span className="text-xl font-bold text-yellow-400">
                                        + {currencyFormatter(result.tax)}
                                    </span>
                                </div>
                                <div className="h-px bg-white/10 mx-6" />
                                <div className="flex items-center justify-between px-6">
                                    <span className="text-zinc-400 font-medium">Total Payable</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {currencyFormatter(result.total)}
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CalculatorLayout>
    );
}
