"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { constructPrompt, generateInsight } from "@/lib/ai";
import {
    Lightbulb,
    Loader2,
    PieChart as PieChartIcon,
    Calendar,
    Percent,
    IndianRupee,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { InputWithToggle, InputWithUnitToggle } from "@/components/ui/InputWithUnitToggle";


export default function EMICalculator() {
    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("");
    const [tenure, setTenure] = useState("");
    const [tenureMode, setTenureMode] = useState<"Years" | "Months">("Years");
    const [processingFee, setProcessingFee] = useState("");
    const [processingFeeMode, setProcessingFeeMode] = useState<"percent" | "flat">("percent");
    const [emi, setEmi] = useState<number | null>(null);
    const [results, setResults] = useState<any>(null); // Store detailed results
    const [schedule, setSchedule] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAllSchedule, setShowAllSchedule] = useState(false);

    const calculate = async () => {
        if (!amount || !rate || !tenure) return;

        setShowAllSchedule(false);

        const p = parseFloat(amount.replace(/,/g, "")); // Handle comma formatted input
        const r = parseFloat(rate) / 12 / 100;

        let n = parseFloat(tenure);
        if (tenureMode === "Years") {
            n = n * 12;
        }

        // Fee calculation
        const feeInput = parseFloat(processingFee) || 0;
        let feeAmount = 0;
        if (processingFeeMode === "percent") {
            feeAmount = (p * feeInput) / 100;
        } else {
            feeAmount = feeInput;
        }

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
            // correction for last month precision
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
            { name: "Principal", value: p, color: "#10b981" }, // Emerald-500
            { name: "Interest", value: totalInterest, color: "#f59e0b" }, // Amber-500
            { name: "Fees", value: feeAmount, color: "#f43f5e" } // Rose-500
        ]);

        // AI Insight
        setLoading(true);
        setInsight(null);
        const prompt = constructPrompt(
            "EMI Calculator",
            { LoanAmount: p, InterestRate: rate, Tenure: `${tenure} ${tenureMode}`, ProcessingFee: feeAmount, ProcessingFeeMode: processingFeeMode },
            { MonthlyEMI: emiValue.toFixed(2), TotalPayment: totalPayment.toFixed(2), TotalInterest: totalInterest.toFixed(2) }
        );

        const aiResult = await generateInsight(prompt);
        setInsight(aiResult);
        setLoading(false);
    };

    const currencyFormatter = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

    const displayedSchedule = showAllSchedule ? schedule : schedule.slice(0, 7);


    return (
        <CalculatorLayout title="EMI Calculator" description="Calculate monthly loan payments">
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 h-fit">
                        <Input
                            label="Loan Amount (₹)"
                            type="number"
                            placeholder="e.g. 5,00,000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <Input
                            label="Interest Rate (% p.a)"
                            type="number"
                            placeholder="e.g. 8.5"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                        />

                        <InputWithToggle
                            label="Tenure"
                            value={tenure}
                            onChange={(val) => setTenure(val)}
                            toggleValue={tenureMode}
                            onToggleChange={setTenureMode}
                            toggleOptions={[
                                { label: "Years", value: "Years" },
                                { label: "Months", value: "Months" }
                            ]}
                            placeholder={tenureMode === "Years" ? "e.g. 5" : "e.g. 60"}
                        />

                        <InputWithToggle
                            label="Processing Fee"
                            value={processingFee}
                            onChange={(val) => setProcessingFee(val)}
                            toggleValue={processingFeeMode}
                            onToggleChange={setProcessingFeeMode}
                            toggleOptions={[
                                { label: "%", value: "percent" },
                                { label: "INR", value: "flat" }
                            ]}
                            placeholder={processingFeeMode === "percent" ? "e.g. 1" : "e.g. 5000"}
                        />

                        <Button
                            onClick={calculate}
                            className="w-full h-14 mt-2 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20"
                        >
                            Calculate EMI
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>

                    {/* Right Column: Chart (Desktop) or Empty */}
                    <div className="hidden lg:flex items-center justify-center p-8 bg-white/[0.02] rounded-3xl border border-white/5 relative overflow-hidden min-h-[400px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        {results ? (
                            <div className="w-full h-80 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.5)" }}
                                            itemStyle={{ color: "#fff", fontWeight: 500 }}
                                            formatter={(value: number | undefined) => value !== undefined ? currencyFormatter(value) : ""}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value) => <span className="text-zinc-400 text-sm ml-1">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] flex flex-col items-center">
                                    <span className="text-zinc-500 text-xs uppercase tracking-wider">Monthly</span>
                                    <span className="text-2xl font-bold text-white">{currencyFormatter(results.monthlyEMI)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-zinc-600 flex flex-col items-center gap-4 text-center">
                                <div className="p-4 bg-white/5 rounded-full">
                                    <PieChartIcon className="w-8 h-8 opacity-40" />
                                </div>
                                <span className="text-sm max-w-[200px]">Enter loan details to view visual breakdown</span>
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
                                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20 flex flex-col items-center justify-center p-6 gap-2">
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Monthly EMI</span>
                                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                                        {currencyFormatter(results.monthlyEMI)}
                                    </span>
                                </Card>
                                <Card className="bg-white/[0.03] border-white/10 flex flex-col items-center justify-center p-6 gap-1">
                                    <span className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Total Interest</span>
                                    <span className="text-xl font-bold text-amber-400">
                                        {currencyFormatter(results.totalInterest)}
                                    </span>
                                </Card>
                                <Card className="bg-white/[0.03] border-white/10 flex flex-col items-center justify-center p-6 gap-1">
                                    <span className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Processing Fee</span>
                                    <span className="text-xl font-bold text-rose-400">
                                        {currencyFormatter(results.processingFee)}
                                    </span>
                                </Card>
                            </div>

                            {/* Detailed Table */}
                            <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/[0.02]">
                                <table className="w-full text-left text-sm text-zinc-400">
                                    <thead className="bg-white/5 text-zinc-400 uppercase tracking-wider text-[10px] sm:text-xs">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Component</th>
                                            <th className="px-6 py-4 font-medium text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4">Loan Amount</td>
                                            <td className="px-6 py-4 text-right text-white font-medium">{currencyFormatter(results.loanAmount)}</td>
                                        </tr>
                                        <tr className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4">Interest Rate</td>
                                            <td className="px-6 py-4 text-right text-white">{results.interestRate}%</td>
                                        </tr>
                                        <tr className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4">Tenure</td>
                                            <td className="px-6 py-4 text-right text-white">{results.tenure}</td>
                                        </tr>
                                        <tr className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4">Total Payment (Principal + Int)</td>
                                            <td className="px-6 py-4 text-right text-white font-medium">{currencyFormatter(results.totalPayment)}</td>
                                        </tr>
                                        <tr className="bg-emerald-500/10 text-white">
                                            <td className="px-6 py-4 font-bold">Total Amount Payable (+Fees)</td>
                                            <td className="px-6 py-4 text-right font-bold text-lg text-emerald-400">{currencyFormatter(results.totalAmountPayable)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Amortization Schedule */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-zinc-200 font-medium text-lg ml-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-zinc-500" />
                                    Amortization Schedule
                                </h3>
                                <div className="rounded-3xl border border-white/10 overflow-hidden overflow-x-auto relative bg-white/[0.02]">
                                    <table className="w-full text-left text-sm text-zinc-400 min-w-[600px]">
                                        <thead className="bg-white/5 text-zinc-400 uppercase tracking-wider text-[10px] sm:text-xs">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Month</th>
                                                <th className="px-6 py-4 font-medium text-right">Principal</th>
                                                <th className="px-6 py-4 font-medium text-right">Interest</th>
                                                <th className="px-6 py-4 font-medium text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {displayedSchedule.map((row) => (
                                                <tr key={row.month} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-3 text-zinc-300">{row.month}</td>
                                                    <td className="px-6 py-3 text-right font-medium text-emerald-400/80">{currencyFormatter(row.principal)}</td>
                                                    <td className="px-6 py-3 text-right font-medium text-amber-400/80">{currencyFormatter(row.interest)}</td>
                                                    <td className="px-6 py-3 text-right text-white font-medium">{currencyFormatter(row.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {!showAllSchedule && schedule.length > 7 && (
                                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
                                    )}
                                </div>

                                {!showAllSchedule && schedule.length > 7 && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowAllSchedule(true)}
                                        className="self-center -mt-10 z-10 shadow-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 rounded-full px-6"
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
                                        Collapse Schedule
                                    </Button>
                                )}
                            </div>

                            {/* Mobile Chart Visibility */}
                            <div className="flex lg:hidden h-80 w-full bg-white/[0.02] rounded-3xl border border-white/10 p-4 flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                            itemStyle={{ color: "#fff" }}
                                            formatter={(value: number | undefined) => value !== undefined ? currencyFormatter(value) : ""}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* AI Insight Card */}
                            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-emerald-500/20 rounded-xl shadow-inner shadow-emerald-500/20 mt-0.5">
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                                        ) : (
                                            <Lightbulb className="w-5 h-5 text-emerald-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Financial Analysis</span>
                                        {loading ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="h-4 w-3/4 bg-emerald-500/10 rounded animate-pulse" />
                                                <div className="h-4 w-1/2 bg-emerald-500/10 rounded animate-pulse" />
                                            </div>
                                        ) : (
                                            <p className="text-zinc-300 text-sm leading-relaxed">
                                                {insight || "Calculate your EMI to generate intelligent financial insights..."}
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
