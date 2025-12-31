"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState, useRef } from "react";
import { constructPrompt, generateInsight } from "@/lib/ai";
import { Lightbulb, Loader2, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

type BankingType = "SI" | "CI" | "FD" | "RD" | "PPF";

export default function BankingCalculators() {
    const [type, setType] = useState<BankingType>("SI");
    const [principal, setPrincipal] = useState("");
    const [rate, setRate] = useState("");
    const [time, setTime] = useState("");
    const [frequency, setFrequency] = useState("1"); // 1=Annual, 4=Quarterly, 12=Monthly (for CI/RD)
    const [inflation, setInflation] = useState("");

    const [result, setResult] = useState<{ maturity: number, interest: number, realValue?: number } | null>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const resultRef = useRef<HTMLDivElement>(null);

    const calculate = async () => {
        if (!principal || !rate || !time) return;

        const p = parseFloat(principal.replace(/,/g, ""));
        const r = parseFloat(rate);
        const t = parseFloat(time);
        const inf = parseFloat(inflation) || 0;

        let maturity = 0;
        let interest = 0;
        let invested = p;

        switch (type) {
            case "SI":
                interest = (p * r * t) / 100;
                maturity = p + interest;
                invested = p;
                break;
            case "CI":
            case "FD":
                const n = parseFloat(frequency);
                maturity = p * Math.pow(1 + (r / 100) / n, n * t);
                interest = maturity - p;
                invested = p;
                break;
            case "RD":
                const months = t * 12;
                interest = p * (months * (months + 1)) / 24.0 * (r / 100);
                invested = p * months;
                maturity = invested + interest;
                break;
            case "PPF":
                // PPF Formula: A = P * [({(1+i)^n} - 1) / i] * (1+i)
                const i = r / 100;
                maturity = p * (((Math.pow(1 + i, t) - 1) / i) * (1 + i));
                invested = p * t;
                interest = maturity - invested;
                break;
        }

        let realValue = 0;
        if (inf > 0) {
            realValue = maturity / Math.pow(1 + inf / 100, t);
        }

        setResult({ maturity, interest, realValue: inf > 0 ? realValue : undefined });

        setLoading(true);
        setInsight(null);
        const prompt = constructPrompt(
            `Banking Calculator (${type})`,
            { Principal: p, Rate: r, TimeYears: t, Inflation: inf > 0 ? `${inf}%` : "None" },
            {
                MaturityAmount: maturity.toFixed(2),
                TotalInterest: interest.toFixed(2),
                RealValue: inf > 0 ? realValue.toFixed(2) : "N/A"
            }
        );

        const aiResult = await generateInsight(prompt);
        setInsight(aiResult);
        setLoading(false);
    };

    const tabs: { id: BankingType, label: string }[] = [
        { id: "SI", label: "Simple Interest" },
        { id: "CI", label: "Compound Interest" },
        { id: "FD", label: "Fixed Deposit" },
        { id: "RD", label: "Recurring Deposit" },
        { id: "PPF", label: "PPF" },
    ];

    const currencyFormatter = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

    const handleSharePDF = async () => {
        if (!result || !resultRef.current) return;

        try {
            // Capture the element
            const dataUrl = await toPng(resultRef.current, {
                backgroundColor: "#09090b",
                pixelRatio: 3, // Ultra High quality for print
            });

            // Standard A4 PDF (Portrait: 210mm x 297mm)
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // 1. Fill Background (Dark Theme: #0a0a0a)
            pdf.setFillColor(10, 10, 10);
            pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

            // Image Dimensions
            const imgProps = pdf.getImageProperties(dataUrl);
            const margin = 20; // 20mm margin
            const availableWidth = pdfWidth - (margin * 2);
            const imgHeight = (imgProps.height * availableWidth) / imgProps.width;

            // 2. Header Design
            // Neon Green Accent Line at top
            pdf.setDrawColor(99, 102, 241); // Indigo-500 (#6366f1) to match Banking Theme
            pdf.setLineWidth(1);
            pdf.line(margin, 15, margin + 20, 15);

            // Title
            pdf.setFontSize(24);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(255, 255, 255);
            pdf.text("ClearCalc", margin, 25);

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(150, 150, 150);
            const reportTitle = tabs.find(t => t.id === type)?.label.toUpperCase() + " REPORT" || "BANKING REPORT";
            pdf.text(reportTitle, margin, 32);

            // 3. Add Image
            const startY = 45;
            pdf.addImage(dataUrl, "PNG", margin, startY, availableWidth, imgHeight);

            // 4. Footer Design
            const date = new Date().toLocaleString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit"
            });

            pdf.setDrawColor(30, 30, 30);
            pdf.line(margin, pdfHeight - 20, pdfWidth - margin, pdfHeight - 20);

            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text(date, margin, pdfHeight - 12);

            pdf.setTextColor(99, 102, 241); // Indigo branding
            pdf.text("clearcalc.ai", pdfWidth - margin, pdfHeight - 12, { align: "right" });

            // Save & Share
            pdf.save("Banking_Report_ClearCalc.pdf");

            const pdfBlob = pdf.output("blob");
            const file = new File([pdfBlob], "Banking_Report_ClearCalc.pdf", { type: "application/pdf" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "Investment Report - ClearCalc",
                    text: "Check out my investment calculation!",
                    files: [file]
                });
            }

        } catch (error: any) {
            console.error("Error generating PDF:", error);
            alert(`Error generating PDF: ${error.message || error}`);
        }
    };

    return (
        <CalculatorLayout title="Banking" description="Calculate returns on investments">
            <div className="flex flex-col gap-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 bg-black/20 p-1 rounded-xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setType(tab.id); setResult(null); }}
                            className={cn(
                                "px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex-1 min-w-[80px]",
                                type === tab.id ? "bg-indigo-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <Input
                        label={
                            type === "RD" ? "Monthly Deposit (₹)" :
                                type === "PPF" ? "Annual Contribution (₹)" :
                                    "Principal Amount (₹)"
                        }
                        type="number"
                        placeholder="e.g. 10,000"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                    />
                    <Input
                        label="Interest Rate (% p.a)"
                        type="number"
                        placeholder={type === "PPF" ? "e.g. 7.1" : "e.g. 7.5"}
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                    />
                    <Input
                        label="Duration (Years)"
                        type="number"
                        placeholder={type === "PPF" ? "Min 15 Years" : "e.g. 5"}
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />

                    <div className="pt-2">
                        <Input
                            label="Inflation Rate (% expected)"
                            type="number"
                            placeholder="e.g. 6.0 (Optional)"
                            value={inflation}
                            onChange={(e) => setInflation(e.target.value)}
                            className="border-indigo-500/20 focus:border-indigo-500/50 placeholder:text-zinc-600"
                        />
                        <p className="text-xs text-zinc-500 mt-1 ml-1">
                            Enter existing inflation to see the <strong>real value</strong> of your returns.
                        </p>
                    </div>

                    {(type === "CI" || type === "FD") && (
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Compounding Frequency</label>
                            <select
                                className="flex h-12 w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                            >
                                <option value="1" className="bg-zinc-900">Annually</option>
                                <option value="2" className="bg-zinc-900">Half-Yearly</option>
                                <option value="4" className="bg-zinc-900">Quarterly</option>
                                <option value="12" className="bg-zinc-900">Monthly</option>
                            </select>
                        </div>
                    )}

                    <Button onClick={calculate} className="mt-2 text-lg bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20">
                        Calculate Returns
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
                            {/* Wrapper for PDF Generation */}
                            <div ref={resultRef} className="flex flex-col gap-4 bg-[#09090b] p-4 rounded-3xl border border-white/5">
                                {/* Input Summary */}
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-xs text-zinc-500">
                                            {type === "RD" ? "Monthly Deposit" : type === "PPF" ? "Annual Contribution" : "principal"}
                                        </span>
                                        <span className="text-sm font-semibold text-white">
                                            {principal ? currencyFormatter(parseFloat(principal.replace(/,/g, ""))) : "₹0"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-xs text-zinc-500">Interest Rate</span>
                                        <span className="text-sm font-semibold text-white">{rate}%</span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-xs text-zinc-500">Duration</span>
                                        <span className="text-sm font-semibold text-white">{time} Years</span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-xs text-zinc-500">Inflation</span>
                                        <span className="text-sm font-semibold text-white">{inflation || "0"}%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Card className="bg-white/5 border-white/10 flex flex-col items-center justify-center py-4 gap-1 p-3">
                                        <span className="text-zinc-400 text-xs">Total Interest</span>
                                        <span className="text-lg font-bold text-green-400">
                                            {currencyFormatter(result.interest)}
                                        </span>
                                    </Card>
                                    <Card className="bg-white/5 border-white/10 flex flex-col items-center justify-center py-4 gap-1 p-3">
                                        <span className="text-zinc-400 text-xs">Invested Amount</span>
                                        <span className="text-lg font-bold text-white">
                                            {currencyFormatter(result.maturity - result.interest)}
                                        </span>
                                    </Card>
                                </div>

                                <Card className="bg-indigo-500/10 border-indigo-500/20 flex flex-col items-center justify-center py-8 gap-2">
                                    <span className="text-zinc-400 text-sm">Maturity Amount</span>
                                    <span className="text-4xl font-bold text-indigo-400">
                                        {currencyFormatter(result.maturity)}
                                    </span>
                                </Card>

                                {result.realValue !== undefined && (
                                    <Card className="bg-orange-500/10 border-orange-500/20 flex flex-col items-center justify-center py-4 gap-1">
                                        <span className="text-zinc-400 text-sm">Inflation Adjusted Value (Real Worth)</span>
                                        <span className="text-2xl font-bold text-orange-400">
                                            {currencyFormatter(result.realValue)}
                                        </span>
                                        <span className="text-xs text-zinc-500 mt-1 text-center">
                                            This is what your money will be worth in today's terms.
                                        </span>
                                    </Card>
                                )}

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
                                                <p className="text-zinc-500 text-sm animate-pulse">Analyzing returns...</p>
                                            ) : (
                                                <p className="text-zinc-300 text-sm leading-relaxed">
                                                    {insight || "Calculating insights..."}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Share Button Block */}
                            <Button
                                variant="secondary"
                                onClick={handleSharePDF}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white"
                            >
                                <Share2 className="w-4 h-4" /> Share / Download PDF
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CalculatorLayout>
    );
}
