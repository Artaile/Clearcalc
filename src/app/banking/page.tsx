"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useState, useRef } from "react";
import { constructPrompt, generateInsight } from "@/lib/ai";
import {
    Lightbulb,
    Loader2,
    Share2,
    Percent,
    TrendingUp,
    Lock,
    RefreshCw,
    PiggyBank,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

type BankingType = "SI" | "CI" | "FD" | "RD" | "PPF";

const FREQUENCY_OPTIONS = [
    { label: "Annually", value: "1" },
    { label: "Half-Yearly", value: "2" },
    { label: "Quarterly", value: "4" },
    { label: "Monthly", value: "12" },
];

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

    const tabs: { id: BankingType, label: string, icon: any }[] = [
        { id: "SI", label: "Simple Interest", icon: Percent },
        { id: "CI", label: "Compound Interest", icon: TrendingUp },
        { id: "FD", label: "Fixed Deposit", icon: Lock },
        { id: "RD", label: "Recurring Deposit", icon: RefreshCw },
        { id: "PPF", label: "PPF", icon: PiggyBank },
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
            <div className="flex flex-col gap-8">
                {/* Scrollable Tabs */}
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 scrollbar-hide no-scrollbar snap-x z-30 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setType(tab.id); setResult(null); }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border snap-center whitespace-nowrap",
                                    type === tab.id
                                        ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]"
                                        : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-6 relative z-20">
                    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                label="Interest Rate (% p.a)"
                                type="number"
                                placeholder={type === "PPF" ? "e.g. 7.1" : "e.g. 7.5"}
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="w-full"
                            />
                            <Input
                                label="Duration (Years)"
                                type="number"
                                placeholder={type === "PPF" ? "Min 15 Years" : "e.g. 5"}
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="pt-2">
                            <div className="relative">
                                <Input
                                    label="Inflation Rate (% expected)"
                                    type="number"
                                    placeholder="e.g. 6.0 (Optional)"
                                    value={inflation}
                                    onChange={(e) => setInflation(e.target.value)}
                                    // Add right padding to prevent text from going under the badge
                                    className="border-indigo-500/10 focus:border-indigo-500/40 pr-24"
                                />
                                {/* Position badge relative to input. Input label ~28px + border/padding. */}
                                <div className="absolute right-3 top-[3.2rem] flex items-center pointer-events-none text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">
                                    Real Value
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 mt-2 ml-1">
                                Enter existing inflation to see the <strong>real value</strong> of your returns.
                            </p>
                        </div>

                        {(type === "CI" || type === "FD") && (
                            <div className="flex flex-col space-y-2">
                                <SearchableSelect
                                    label="Compounding Frequency"
                                    options={FREQUENCY_OPTIONS}
                                    value={frequency}
                                    onChange={setFrequency}
                                />
                            </div>
                        )}

                        <Button
                            onClick={calculate}
                            className="w-full h-14 mt-2 text-lg font-bold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white shadow-lg shadow-indigo-500/20"
                        >
                            Calculate Returns
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
                                {/* Wrapper for PDF Generation */}
                                <div ref={resultRef} className="flex flex-col gap-4 bg-[#09090b] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                                    {/* Background Glow */}
                                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                    {/* Input Summary - Horizontal on Desktop */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2 relative z-10">
                                        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">
                                                {type === "RD" ? "Deposit" : type === "PPF" ? "Contrib." : "Principal"}
                                            </span>
                                            <span className="text-sm font-semibold text-white truncate">
                                                {principal ? currencyFormatter(parseFloat(principal.replace(/,/g, ""))) : "₹0"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">Rate</span>
                                            <span className="text-sm font-semibold text-white">{rate}%</span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">Duration</span>
                                            <span className="text-sm font-semibold text-white">{time} Yrs</span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">Inflation</span>
                                            <span className="text-sm font-semibold text-white">{inflation || "0"}%</span>
                                        </div>
                                    </div>

                                    {/* Main Result Block */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                        <Card className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border-indigo-500/20 flex flex-col items-center justify-center p-6 gap-2 sm:col-span-2">
                                            <span className="text-zinc-400 text-sm font-medium">Maturity Amount</span>
                                            <span className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                                                {currencyFormatter(result.maturity)}
                                            </span>
                                        </Card>

                                        <Card className="bg-white/[0.03] border-white/10 flex flex-col items-center justify-center p-4 gap-1">
                                            <span className="text-zinc-500 text-xs uppercase tracking-wider">Total Interest</span>
                                            <span className="text-xl font-bold text-emerald-400">
                                                + {currencyFormatter(result.interest)}
                                            </span>
                                        </Card>
                                        <Card className="bg-white/[0.03] border-white/10 flex flex-col items-center justify-center p-4 gap-1">
                                            <span className="text-zinc-500 text-xs uppercase tracking-wider">Invested</span>
                                            <span className="text-xl font-bold text-zinc-300">
                                                {currencyFormatter(result.maturity - result.interest)}
                                            </span>
                                        </Card>
                                    </div>

                                    {result.realValue !== undefined && (
                                        <Card className="bg-orange-500/10 border-orange-500/20 flex flex-col items-center justify-center py-5 gap-2 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-orange-400" />
                                                <span className="text-orange-200/60 text-sm font-medium">Inflation Adjusted Value</span>
                                            </div>
                                            <span className="text-3xl font-bold text-orange-400/90">
                                                {currencyFormatter(result.realValue)}
                                            </span>
                                            <span className="text-xs text-zinc-500 text-center max-w-[250px]">
                                                This is the purchasing power of your maturity amount in today's money.
                                            </span>
                                        </Card>
                                    )}

                                    {/* AI Insight Card */}
                                    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-5 relative z-10">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-indigo-500/20 rounded-xl mt-0.5 shadow-inner shadow-indigo-500/20">
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                                ) : (
                                                    <Lightbulb className="w-5 h-5 text-indigo-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                                    AI Financial Insight
                                                </span>
                                                {loading ? (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="h-4 w-3/4 bg-indigo-400/10 rounded animate-pulse" />
                                                        <div className="h-4 w-1/2 bg-indigo-400/10 rounded animate-pulse" />
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                                        {insight || "Calculating intelligent insights for your investment..."}
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
                                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white h-12"
                                >
                                    <Share2 className="w-4 h-4" /> Download / Share PDF Report
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CalculatorLayout>
    );
}
