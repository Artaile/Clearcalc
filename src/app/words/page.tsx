"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { Clipboard, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function numberToWords(num: number): string {
    if (num === 0) return "Zero";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function convert(n: number): string {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convert(n % 100) : "");
        if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
        if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
        return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
    }

    return convert(num);
}

export default function AmountToWords() {
    const [amount, setAmount] = useState("");
    const [words, setWords] = useState("");
    const [copied, setCopied] = useState(false);

    const calculate = () => {
        if (!amount) return;
        const val = parseInt(amount);
        if (!isNaN(val)) {
            setWords(numberToWords(val) + " Only");
        }
    };

    const copyToClipboard = () => {
        if (words) {
            navigator.clipboard.writeText(words);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <CalculatorLayout title="Amount to Words" description="Convert numbers to text">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="e.g. 15000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button onClick={calculate} className="mt-2 text-lg">
                        Convert
                    </Button>
                </div>

                <AnimatePresence>
                    {words && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col gap-4"
                        >
                            <Card className="bg-cyan-500/10 border-cyan-500/20 flex flex-col items-center justify-center p-6 gap-4 relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-cyan-400 hover:text-cyan-300"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
                                </Button>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <span className="text-zinc-400 text-sm">In Words</span>
                                    <p className="text-xl font-medium text-cyan-300 leading-relaxed">
                                        {words}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CalculatorLayout>
    );
}
