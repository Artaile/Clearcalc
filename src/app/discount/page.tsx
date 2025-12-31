"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiscountCalculator() {
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [result, setResult] = useState<{ saved: number, final: number } | null>(null);

    const calculate = () => {
        if (!price || !discount) return;

        const p = parseFloat(price.replace(/,/g, ""));
        const d = parseFloat(discount);

        const saved = (p * d) / 100;
        const final = p - saved;

        setResult({ saved, final });
    };

    return (
        <CalculatorLayout title="Discount Calculator" description="Calculate sale price & savings">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <Input
                        label="Original Price (₹)"
                        type="text"
                        placeholder="e.g. 2,500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                    <Input
                        label="Discount (%)"
                        type="number"
                        placeholder="e.g. 20"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                    />
                    <Button onClick={calculate} className="mt-2 text-lg">
                        Calculate Savings
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
                                <Card className="bg-white/5 border-white/10 flex flex-col items-center justify-center py-4 gap-1 p-3">
                                    <span className="text-zinc-400 text-xs">You Save</span>
                                    <span className="text-lg font-bold text-green-400">
                                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(result.saved)}
                                    </span>
                                </Card>
                                <Card className="bg-white/5 border-white/10 flex flex-col items-center justify-center py-4 gap-1 p-3">
                                    <span className="text-zinc-400 text-xs">Final Price</span>
                                    <span className="text-lg font-bold text-white">
                                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(result.final)}
                                    </span>
                                </Card>
                            </div>

                            <Card className="bg-pink-500/10 border-pink-500/20 flex flex-col items-center justify-center py-8 gap-2">
                                <span className="text-zinc-400 text-sm">Pay Only</span>
                                <span className="text-4xl font-bold text-pink-400">
                                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(result.final)}
                                </span>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CalculatorLayout>
    );
}
