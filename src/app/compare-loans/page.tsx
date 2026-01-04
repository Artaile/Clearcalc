"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { constructPrompt, generateInsight } from "@/lib/ai";
import { Lightbulb, Loader2, Trophy, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { InputWithToggle, InputWithUnitToggle } from "@/components/ui/InputWithUnitToggle";

type LoanInput = {
    amount: string;
    rate: string;
    tenure: string;
    tenureMode: "Years" | "Months";
    processingFee: string;
    processingFeeMode: "percent" | "flat";
};

type LoanResult = {
    emi: number;
    interest: number;
    fees: number;
    totalPayment: number; // Principal + Interest
    totalCost: number;    // Interest + Fees
    totalAmountPayable: number; // Principal + Interest + Fees
    chartData: any[];
};

export default function CompareLoans() {
    const [loan1, setLoan1] = useState<LoanInput>({ amount: "", rate: "", tenure: "", tenureMode: "Years", processingFee: "", processingFeeMode: "percent" });
    const [loan2, setLoan2] = useState<LoanInput>({ amount: "", rate: "", tenure: "", tenureMode: "Years", processingFee: "", processingFeeMode: "percent" });
    const [result1, setResult1] = useState<LoanResult | null>(null);
    const [result2, setResult2] = useState<LoanResult | null>(null);

    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const calculateLoan = (loan: LoanInput): LoanResult | null => {
        if (!loan.amount || !loan.rate || !loan.tenure) return null;

        const p = parseFloat(loan.amount.replace(/,/g, ""));
        const r = parseFloat(loan.rate) / 12 / 100;

        let n = parseFloat(loan.tenure);
        if (loan.tenureMode === "Years") {
            n = n * 12;
        }


        const feeInput = parseFloat(loan.processingFee) || 0;
        let feeAmount = 0;
        if (loan.processingFeeMode === "flat") {
            feeAmount = feeInput;
        } else {
            feeAmount = (p * feeInput) / 100;
        }

        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const interest = totalPayment - p;
        const totalCost = interest + feeAmount;
        const totalAmountPayable = totalPayment + feeAmount;

        const chartData = [
            { name: "Principal", value: p, color: "#39ff14" },
            { name: "Interest", value: interest, color: "#22d3ee" },
            { name: "Fees", value: feeAmount, color: "#f43f5e" }
        ];

        return { emi, interest, fees: feeAmount, totalPayment, totalCost, totalAmountPayable, chartData };
    };

    const calculate = async () => {
        const r1 = calculateLoan(loan1);
        const r2 = calculateLoan(loan2);

        setResult1(r1);
        setResult2(r2);

        if (r1 && r2) {
            // AI Insight
            setLoading(true);
            setInsight(null);

            const diffCost = Math.abs(r1.totalCost - r2.totalCost);
            const betterLoan = r1.totalCost < r2.totalCost ? "Loan 1" : "Loan 2";

            const prompt = constructPrompt(
                "Compare Loans",
                {
                    Loan1: `P: ${loan1.amount}, R: ${loan1.rate}, T: ${loan1.tenure} ${loan1.tenureMode}, Fee: ${loan1.processingFee} (${loan1.processingFeeMode})`,
                    Loan2: `P: ${loan2.amount}, R: ${loan2.rate}, T: ${loan2.tenure} ${loan2.tenureMode}, Fee: ${loan2.processingFee} (${loan2.processingFeeMode})`
                },
                {
                    BetterOption: betterLoan,
                    CostDifference: diffCost.toFixed(2),
                    Loan1TotalCost: r1.totalCost.toFixed(2),
                    Loan2TotalCost: r2.totalCost.toFixed(2)
                }
            );

            const aiResult = await generateInsight(prompt);
            setInsight(aiResult);
            setLoading(false);
        }
    };

    const currencyFormatter = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

    const updateLoan1 = (field: keyof LoanInput, val: any) => setLoan1(prev => ({ ...prev, [field]: val }));
    const updateLoan2 = (field: keyof LoanInput, val: any) => setLoan2(prev => ({ ...prev, [field]: val }));

    const renderLoanInput = (index: number, loan: LoanInput, update: (field: keyof LoanInput, val: any) => void, colorClass: string, bgClass: string) => (
        <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full ${bgClass} flex items-center justify-center ${colorClass} font-bold text-xs`}>{index}</div>
                <h3 className="text-zinc-300 font-medium">Loan Option {index}</h3>
            </div>

            <Input
                label="Loan Amount"
                value={loan.amount}
                onChange={(e) => update("amount", e.target.value)}
                type="number" // Uses Input's internal handling for commas
                placeholder="20,00,000"
            />

            <Input
                label="Rate (% p.a)"
                value={loan.rate}
                onChange={(e) => update("rate", e.target.value)}
                type="number"
                placeholder="8.5"
            />

            <InputWithToggle
                label="Tenure"
                value={loan.tenure}
                onChange={(val) => update("tenure", val)}
                toggleValue={loan.tenureMode}
                onToggleChange={(mode) => update("tenureMode", mode)}
                toggleOptions={[
                    { label: "Years", value: "Years" },
                    { label: "Months", value: "Months" }
                ]}
                placeholder={loan.tenureMode === "Years" ? "20" : "240"}
            />

            <InputWithToggle
                label="Processing Fee"
                value={loan.processingFee}
                onChange={(val) => update("processingFee", val)}
                toggleValue={loan.processingFeeMode}
                onToggleChange={(mode) => update("processingFeeMode", mode)}
                toggleOptions={[
                    { label: "%", value: "percent" },
                    { label: "INR", value: "flat" }
                ]}
                placeholder={loan.processingFeeMode === "percent" ? "0.5" : "5000"}
            />
        </div>
    );

    const renderResultCard = (result: LoanResult | null, otherResult: LoanResult | null, title: string) => {
        if (!result || !otherResult) return null;
        const isBetter = result.totalCost < otherResult.totalCost;

        return (
            <Card className={cn(
                "border flex flex-col gap-3 p-4 relative overflow-hidden",
                isBetter ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/10"
            )}>
                {isBetter && (
                    <div className="absolute top-2 right-2 text-green-400 flex items-center gap-1 text-xs font-bold bg-green-500/20 px-2 py-1 rounded">
                        <Trophy className="w-3 h-3" /> BEST OPTION
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="text-xs text-zinc-400 uppercase">{title} Total Cost</span>
                    <span className={cn("text-xl font-bold", isBetter ? "text-green-400" : "text-white")}>
                        {currencyFormatter(result.totalCost)}
                    </span>
                    <span className="text-[10px] text-zinc-500">(Interest + Fees)</span>
                </div>

                <div className="h-32 w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={result.chartData}
                                innerRadius={30}
                                outerRadius={40}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {result.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                                itemStyle={{ color: "#fff" }}
                                formatter={(value: any) => currencyFormatter(value)}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">EMI</span>
                        <span className="text-zinc-300 font-medium">{currencyFormatter(result.emi)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Interest</span>
                        <span className="text-zinc-300 font-medium">{currencyFormatter(result.interest)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Fees</span>
                        <span className="text-zinc-300 font-medium">{currencyFormatter(result.fees)}</span>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <CalculatorLayout title="Compare Loans" description="Side-by-side loan comparison">
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderLoanInput(1, loan1, updateLoan1, "text-blue-400", "bg-blue-500/20")}
                    {renderLoanInput(2, loan2, updateLoan2, "text-orange-400", "bg-orange-500/20")}
                </div>

                <Button onClick={calculate} className="w-full sm:w-auto self-center text-lg bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20 px-8">
                    Compare Now
                </Button>

                <AnimatePresence>
                    {result1 && result2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Comparison Result */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderResultCard(result1, result2, "Loan A")}
                                {renderResultCard(result2, result1, "Loan B")}
                            </div>

                            {/* Savings Callout */}
                            <Card className="bg-emerald-500/10 border-emerald-500/20 p-4 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-emerald-400 font-bold mb-1">
                                        Save {currencyFormatter(Math.abs(result1.totalCost - result2.totalCost))}
                                    </h4>
                                    <p className="text-zinc-400 text-sm">
                                        By choosing the better loan option, you will save on total cost (Interest + Processing Fees).
                                    </p>
                                </div>
                            </Card>

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
                                            <p className="text-zinc-500 text-sm animate-pulse">Comparing options...</p>
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
