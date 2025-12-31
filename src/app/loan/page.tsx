"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { constructPrompt, generateInsight } from "@/lib/ai";
import { Lightbulb, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function LoanCalculator() {
    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("");
    const [tenure, setTenure] = useState("");
    const [tenureMode, setTenureMode] = useState<"Years" | "Months">("Years");
    const [processingFee, setProcessingFee] = useState("");
    const [emi, setEmi] = useState<number | null>(null);
    const [results, setResults] = useState<any>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAllSchedule, setShowAllSchedule] = useState(false);

    const calculate = async () => {
        if (!amount || !rate || !tenure) return;

        setShowAllSchedule(false);

        const p = parseFloat(amount.replace(/,/g, ""));
        const r = parseFloat(rate) / 12 / 100;

        let n = parseFloat(tenure);
        if (tenureMode === "Years") {
            n = n * 12;
        }

        // Fee calculation
        const feePercent = parseFloat(processingFee) || 0;
        const feeAmount = (p * feePercent) / 100;

        const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setEmi(emiValue);

        const totalPayment = emiValue * n;
        const totalInterest = totalPayment - p;
        const totalAmountPayable = totalPayment + feeAmount;

        setResults({
            loanAmount: p,
            interestRate: rate,
            tenure: `${tenure} ${tenureMode}`,
            monthlyEMI: emiValue,
            totalInterest: totalInterest,
            processingFee: feeAmount,
            totalPayment: totalPayment,
            totalAmountPayable: totalAmountPayable
        });

        // Calculate Amortization Schedule
        let balance = p;
        const newSchedule = [];
        for (let i = 1; i <= n; i++) {
            const interestForMonth = balance * r;
            const principalForMonth = emiValue - interestForMonth;
            balance -= principalForMonth;
            if (balance < 0) balance = 0;

            newSchedule.push({
                month: i,
                principal: principalForMonth,
                interest: interestForMonth,
                balance: balance
            });
        }
        setSchedule(newSchedule);

        setChartData([
            { name: "Principal", value: p, color: "#39ff14" },
            { name: "Interest", value: totalInterest, color: "#22d3ee" },
            { name: "Fees", value: feeAmount, color: "#f43f5e" }
        ]);

        // AI Insight
        setLoading(true);
        setInsight(null);
        const prompt = constructPrompt(
            "Loan Calculator",
            { LoanAmount: p, InterestRate: rate, Tenure: `${tenure} ${tenureMode}`, ProcessingFee: feeAmount },
            { MonthlyEMI: emiValue.toFixed(2), TotalPayment: totalPayment.toFixed(2), TotalInterest: totalInterest.toFixed(2) }
        );

        const aiResult = await generateInsight(prompt);
        setInsight(aiResult);
        setLoading(false);
    };

    const currencyFormatter = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

    const displayedSchedule = showAllSchedule ? schedule : schedule.slice(0, 7);

    return (
        <CalculatorLayout title="Loan Calculator" description="See interest vs principal breakdown">
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                        <Input
                            label="Loan Amount (₹)"
                            type="number"
                            placeholder="e.g. 10,00,000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <Input
                            label="Interest Rate (% p.a)"
                            type="number"
                            placeholder="e.g. 9.0"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                        />

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Tenure</label>
                            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 w-fit mb-1">
                                <button
                                    onClick={() => setTenureMode("Years")}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tenureMode === "Years" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    Years
                                </button>
                                <button
                                    onClick={() => setTenureMode("Months")}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tenureMode === "Months" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    Months
                                </button>
                            </div>
                            <Input
                                type="number"
                                placeholder={tenureMode === "Years" ? "e.g. 5" : "e.g. 60"}
                                value={tenure}
                                onChange={(e) => setTenure(e.target.value)}
                                className="mt-0"
                            />
                        </div>

                        <Input
                            label="Processing Fee (%)"
                            type="number"
                            placeholder="e.g. 0.5"
                            value={processingFee}
                            onChange={(e) => setProcessingFee(e.target.value)}
                        />

                        <Button onClick={calculate} className="mt-2 text-lg">
                            Calculate Results
                        </Button>
                    </div>

                    {/* Right Column: Chart */}
                    <div className="hidden md:flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10">
                        {results ? (
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                                            itemStyle={{ color: "#fff" }}
                                            formatter={(value: number) => currencyFormatter(value)}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-zinc-600 flex flex-col items-center gap-2">
                                <Lightbulb className="w-8 h-8 opacity-20" />
                                <span className="text-sm">Enter details to view breakdown</span>
                            </div>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="bg-primary/10 border-primary/20 flex flex-col items-center justify-center py-4 gap-1">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Monthly EMI</span>
                                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                                        {currencyFormatter(results.monthlyEMI)}
                                    </span>
                                </Card>
                                <Card className="bg-white/5 border-white/10 flex flex-col items-center justify-center py-4 gap-1">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Total Interest</span>
                                    <span className="text-xl sm:text-2xl font-bold text-cyan-400">
                                        {currencyFormatter(results.totalInterest)}
                                    </span>
                                </Card>
                                <Card className="bg-white/5 border-white/10 flex flex-col items-center justify-center py-4 gap-1">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Processing Fee</span>
                                    <span className="text-xl sm:text-2xl font-bold text-rose-400">
                                        {currencyFormatter(results.processingFee)}
                                    </span>
                                </Card>
                            </div>

                            {/* Detailed Table */}
                            <div className="rounded-2xl border border-white/10 overflow-hidden">
                                <table className="w-full text-left text-sm text-zinc-400">
                                    <thead className="bg-white/5 text-zinc-200 uppercase tracking-wider text-xs">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Component</th>
                                            <th className="px-6 py-3 font-medium text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="bg-black/20">
                                            <td className="px-6 py-3">Loan Amount</td>
                                            <td className="px-6 py-3 text-right text-white font-medium">{currencyFormatter(results.loanAmount)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-3">Interest Rate</td>
                                            <td className="px-6 py-3 text-right text-white">{results.interestRate}%</td>
                                        </tr>
                                        <tr className="bg-black/20">
                                            <td className="px-6 py-3">Tenure</td>
                                            <td className="px-6 py-3 text-right text-white">{results.tenure}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-3">Total Payment (Principal + Int)</td>
                                            <td className="px-6 py-3 text-right text-white font-medium">{currencyFormatter(results.totalPayment)}</td>
                                        </tr>
                                        <tr className="bg-white/5 text-white">
                                            <td className="px-6 py-4 font-bold">Total Amount Payable (+Fees)</td>
                                            <td className="px-6 py-4 text-right font-bold text-lg text-primary">{currencyFormatter(results.totalAmountPayable)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Amortization Schedule */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-zinc-200 font-medium text-lg">Amortization Schedule</h3>
                                <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto relative">
                                    <table className="w-full text-left text-sm text-zinc-400 min-w-[500px]">
                                        <thead className="bg-white/5 text-zinc-200 uppercase tracking-wider text-xs">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Month</th>
                                                <th className="px-4 py-3 font-medium text-right">Principal</th>
                                                <th className="px-4 py-3 font-medium text-right">Interest</th>
                                                <th className="px-4 py-3 font-medium text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {displayedSchedule.map((row) => (
                                                <tr key={row.month} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-2.5 text-zinc-300">{row.month}</td>
                                                    <td className="px-4 py-2.5 text-right font-medium text-emerald-400">{currencyFormatter(row.principal)}</td>
                                                    <td className="px-4 py-2.5 text-right font-medium text-orange-400">{currencyFormatter(row.interest)}</td>
                                                    <td className="px-4 py-2.5 text-right text-white font-medium">{currencyFormatter(row.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {!showAllSchedule && schedule.length > 7 && (
                                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                                    )}
                                </div>

                                {!showAllSchedule && schedule.length > 7 && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowAllSchedule(true)}
                                        className="self-center mt-[-20px] z-10 shadow-lg border border-white/10 bg-zinc-900 hover:bg-zinc-800"
                                    >
                                        View Full Schedule ({schedule.length - 7} more)
                                    </Button>
                                )}
                                {showAllSchedule && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAllSchedule(false)}
                                        className="self-center text-zinc-500 hover:text-white"
                                    >
                                        Collapse
                                    </Button>
                                )}
                            </div>

                            {/* Mobile Chart Visibility */}
                            <div className="flex md:hidden h-64 w-full bg-white/5 rounded-2xl border border-white/10 p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                                            itemStyle={{ color: "#fff" }}
                                            formatter={(value: number) => currencyFormatter(value)}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
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
                                            <p className="text-zinc-500 text-sm animate-pulse">Analyzing loan structure...</p>
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
