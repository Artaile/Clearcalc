"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState, useRef } from "react";
import { constructPrompt, generateInsight } from "@/lib/ai";
import { Lightbulb, Loader2, CheckCircle2, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export default function LoanEligibility() {
    const [income, setIncome] = useState("");
    const [existingEMI, setExistingEMI] = useState("");
    const [rate, setRate] = useState("");
    const [tenure, setTenure] = useState("");
    const [tenureMode, setTenureMode] = useState<"Years" | "Months">("Years");
    const [result, setResult] = useState<{ maxLoan: number, maxEMI: number } | null>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Ref for the element we want to print/share
    const resultRef = useRef<HTMLDivElement>(null);

    const calculate = async () => {
        if (!income || !rate || !tenure) return;

        const inc = parseFloat(income.replace(/,/g, ""));
        const emi = parseFloat(existingEMI.replace(/,/g, "")) || 0;
        const r = parseFloat(rate) / 12 / 100;

        let n = parseFloat(tenure);
        if (tenureMode === "Years") {
            n = n * 12;
        }

        // FOIR Calculation (Fixed Obligation to Income Ratio)
        // Assuming 50% of income is available for EMIs
        const maxAllowableEMI = inc * 0.5;
        const availableEMI = maxAllowableEMI - emi;

        if (availableEMI <= 0) {
            setResult({ maxLoan: 0, maxEMI: 0 });
            return;
        }

        // Calculate Max Loan Amount from Available EMI
        // P = E * [(1+r)^n - 1] / [r(1+r)^n]
        const maxLoan = availableEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

        setResult({ maxLoan, maxEMI: availableEMI });

        // AI Insight
        setLoading(true);
        setInsight(null);
        const prompt = constructPrompt(
            "Loan Eligibility Checker",
            { MonthlyIncome: inc, ExistingEMI: emi, InterestRate: rate, Tenure: `${tenure} ${tenureMode}` },
            {
                MaxEligibleLoan: maxLoan.toFixed(2),
                MaxMonthlyEMI: availableEMI.toFixed(2),
                FOIRUsed: "50%"
            }
        );

        const aiResult = await generateInsight(prompt);
        setInsight(aiResult);
        setLoading(false);
    };

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
            const margin = 20; // 20mm margin for cleaner look
            const availableWidth = pdfWidth - (margin * 2);
            const imgHeight = (imgProps.height * availableWidth) / imgProps.width;

            // 2. Header Design
            // Neon Green Accent Line at top
            pdf.setDrawColor(57, 255, 20);
            pdf.setLineWidth(1);
            pdf.line(margin, 15, margin + 20, 15); // Short accent line

            // Title
            pdf.setFontSize(24);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(255, 255, 255); // White
            pdf.text("ClearCalc", margin, 25);

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(150, 150, 150); // Light Grey
            pdf.text("FINANCIAL ELIGIBILITY REPORT", margin, 32);

            // 3. Add Image
            // Centered vertically if space allows, otherwise with top padding
            const startY = 45;
            pdf.addImage(dataUrl, "PNG", margin, startY, availableWidth, imgHeight);

            // 4. Footer Design
            const date = new Date().toLocaleString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit"
            });

            // Footer Separator (Subtle line)
            pdf.setDrawColor(30, 30, 30);
            pdf.line(margin, pdfHeight - 20, pdfWidth - margin, pdfHeight - 20);

            // Footer Text
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100); // Darker Grey
            pdf.text(date, margin, pdfHeight - 12);

            pdf.setTextColor(57, 255, 20); // Neon branding
            pdf.text("clearcalc.ai", pdfWidth - margin, pdfHeight - 12, { align: "right" });

            // Save & Share
            pdf.save("LoanEligibility_ClearCalc.pdf");

            const pdfBlob = pdf.output("blob");
            const file = new File([pdfBlob], "LoanEligibility_ClearCalc.pdf", { type: "application/pdf" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "My Loan Eligibility - ClearCalc",
                    text: "Check out my loan eligibility result!",
                    files: [file]
                });
            }

        } catch (error: any) {
            console.error("Error generating PDF:", error);
            alert(`Error generating PDF: ${error.message || error}`);
        }
    };

    return (
        <CalculatorLayout title="Loan Eligibility" description="Check your borrowing capacity">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <Input
                        label="Net Monthly Income (₹)"
                        type="number"
                        placeholder="e.g. 50,000"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                    />
                    <Input
                        label="Total Existing EMIs (₹)"
                        type="number"
                        placeholder="e.g. 5,000 (Optional)"
                        value={existingEMI}
                        onChange={(e) => setExistingEMI(e.target.value)}
                    />
                    <Input
                        label="Interest Rate (% p.a)"
                        type="number"
                        placeholder="e.g. 8.5"
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
                            placeholder={tenureMode === "Years" ? "e.g. 20" : "e.g. 240"}
                            value={tenure}
                            onChange={(e) => setTenure(e.target.value)}
                            className="mt-0"
                        />
                    </div>

                    <Button onClick={calculate} className="mt-2 text-lg bg-teal-500 hover:bg-teal-600 shadow-teal-500/20">
                        Check Eligibility
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
                            {/* Result Container for PDF Generation */}
                            <div ref={resultRef} className="flex flex-col gap-4 bg-[#09090b] p-4 rounded-3xl border border-white/5">

                                {/* Input Summary */}
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-xs text-zinc-500">Monthly Income</span>
                                        <span className="text-sm font-semibold text-white">
                                            {income ? currencyFormatter(parseFloat(income.replace(/,/g, ""))) : "₹0"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-xs text-zinc-500">Interest Rate</span>
                                        <span className="text-sm font-semibold text-white">{rate}%</span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-xs text-zinc-500">Tenure</span>
                                        <span className="text-sm font-semibold text-white">{tenure} {tenureMode}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-xs text-zinc-500">Existing EMI</span>
                                        <span className="text-sm font-semibold text-white">
                                            {existingEMI ? currencyFormatter(parseFloat(existingEMI.replace(/,/g, ""))) : "₹0"}
                                        </span>
                                    </div>
                                </div>

                                <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/20 p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                                    <span className="text-zinc-400 text-sm uppercase tracking-wider">Maximum Eligible Loan</span>
                                    <span className="text-4xl font-bold text-teal-400">
                                        {currencyFormatter(result.maxLoan)}
                                    </span>
                                    <div className="flex items-center gap-2 mt-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        <CheckCircle2 className="w-4 h-4 text-teal-400" />
                                        <span className="text-zinc-300 text-sm">
                                            Max EMI: <span className="text-white font-bold">{currencyFormatter(result.maxEMI)}</span>
                                        </span>
                                    </div>
                                    <div className="mt-4 text-xs text-zinc-500">
                                        Calculated by ClearCalc
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
                                                <p className="text-zinc-500 text-sm animate-pulse">Evaluating eligibility...</p>
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
