"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useState, useEffect } from "react";
import { constructPrompt, generateInsight } from "@/lib/ai";
import {
    Lightbulb,
    Loader2,
    Coins,
    Gem,
    Globe,
    Hammer,
    Scale,
    ArrowRight,
    RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type CountryCode = "IN" | "AE" | "SG" | "US" | "UK" | "OTH";

interface CountryConfig {
    code: CountryCode;
    name: string;
    currency: string;
    taxName: string;
    defaultTax: string;
    showWastage: boolean;
    flag: string;
}

const COUNTRIES: CountryConfig[] = [
    { code: "IN", name: "India", currency: "INR", taxName: "GST", defaultTax: "3", showWastage: true, flag: "🇮🇳" },
    { code: "AE", name: "UAE (Dubai)", currency: "AED", taxName: "VAT", defaultTax: "5", showWastage: false, flag: "🇦🇪" },
    { code: "SG", name: "Singapore", currency: "SGD", taxName: "GST", defaultTax: "9", showWastage: false, flag: "🇸🇬" },
    { code: "US", name: "USA", currency: "USD", taxName: "Sales Tax", defaultTax: "8", showWastage: false, flag: "🇺🇸" },
    { code: "UK", name: "United Kingdom", currency: "GBP", taxName: "VAT", defaultTax: "20", showWastage: false, flag: "🇬🇧" },
    { code: "OTH", name: "Other / Generic", currency: "GEN", taxName: "Tax", defaultTax: "0", showWastage: true, flag: "🌍" },
];

export default function GoldCalculator() {
    const [country, setCountry] = useState<CountryCode>("IN");
    const [rate, setRate] = useState("");
    const [weight, setWeight] = useState("");

    // Making Charges
    const [mcValue, setMcValue] = useState("");
    const [mcType, setMcType] = useState<"percentage" | "flat">("percentage");

    // Wastage (Sethu)
    const [wastageValue, setWastageValue] = useState("");
    const [wastageType, setWastageType] = useState<"percentage" | "grams">("percentage");

    // Tax
    const [taxRate, setTaxRate] = useState("3");
    const [includeTax, setIncludeTax] = useState(true);

    const [result, setResult] = useState<any>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Update defaults when country changes
    useEffect(() => {
        const config = COUNTRIES.find(c => c.code === country)!;
        setTaxRate(config.defaultTax);
        // Reset result on country change
        setResult(null);
        setInsight(null);
    }, [country]);

    const currentConfig = COUNTRIES.find(c => c.code === country)!;
    const currency = currentConfig.currency === "GEN" ? "" : currentConfig.currency;

    const formatInput = (val: string) => {
        // Remove all non-numeric chars except decimal
        const clean = val.replace(/[^0-9.]/g, "");
        if (!clean) return "";

        // Split decimal
        const parts = clean.split(".");

        // Standard Indian formatting logic using regex
        const intPart = parts[0];
        let lastThree = intPart.substring(intPart.length - 3);
        const otherNumbers = intPart.substring(0, intPart.length - 3);
        const formattedInt = otherNumbers !== ""
            ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
            : lastThree;

        return parts.length > 1 ? `${formattedInt}.${parts[1].slice(0, 2)}` : formattedInt;
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/,/g, "");
        if (isNaN(Number(val)) && val !== "") return;
        setRate(val === "" ? "" : formatInput(val));
    };

    const handleMcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/,/g, "");
        if (isNaN(Number(val)) && val !== "") return;
        setMcValue(val === "" ? "" : mcType === "flat" ? formatInput(val) : val);
    };

    const calculate = async () => {
        if (!rate || !weight) return;

        const r = parseFloat(rate.replace(/,/g, ""));
        const w = parseFloat(weight);

        // 1. Base Gold Value
        const baseValue = r * w;

        // 2. Wastage (VA)
        let wastageCost = 0;
        if (currentConfig.showWastage && wastageValue) {
            const v = parseFloat(wastageValue);
            if (wastageType === "percentage") {
                wastageCost = baseValue * (v / 100);
            } else {
                wastageCost = v * r; // Grams * Rate
            }
        }

        // 3. Making Charges (MC)
        let mcCost = 0;
        if (mcValue) {
            const m = parseFloat(mcValue.replace(/,/g, ""));
            if (mcType === "percentage") {
                mcCost = baseValue * (m / 100);
            } else {
                mcCost = m;
            }
        }

        const subtotal = baseValue + wastageCost + mcCost;

        // 4. Tax
        let taxAmount = 0;
        if (includeTax && taxRate) {
            const t = parseFloat(taxRate);
            taxAmount = subtotal * (t / 100);
        }

        const finalAmount = subtotal + taxAmount;

        setResult({
            baseValue,
            wastageCost,
            mcCost,
            subtotal,
            taxAmount,
            finalAmount
        });

        // AI Insight
        setLoading(true);
        setInsight(null);
        const prompt = constructPrompt(
            `Gold Purchase (${currentConfig.name})`,
            {
                GoldRate: r,
                Weight: w,
                MakingCharges: mcCost.toFixed(2),
                Wastage: wastageCost.toFixed(2),
                Tax: taxAmount.toFixed(2)
            },
            { FinalAmount: finalAmount.toFixed(2) }
        );

        const aiResult = await generateInsight(prompt);
        setInsight(aiResult);
        setLoading(false);
    };

    const formatter = (val: number) => {
        return new Intl.NumberFormat(
            country === "IN" ? "en-IN" : "en-US",
            {
                style: "currency",
                currency: currentConfig.currency === "GEN" ? "USD" : currentConfig.currency,
                currencyDisplay: currentConfig.currency === "GEN" ? "narrowSymbol" : "symbol"
            }
        ).format(val).replace(currentConfig.currency === "GEN" ? "$" : "", currentConfig.currency === "GEN" ? " " : "");
    };

    return (
        <CalculatorLayout title="Gold Purchase Calculator" description="Calculate final price with tax & wastage">
            <div className="flex flex-col gap-6">

                {/* Country Selector */}
                <div className="relative z-20">
                    <SearchableSelect
                        label="Select Buying Country"
                        placeholder="Select Country..."
                        options={COUNTRIES.map(c => ({ label: `${c.flag} ${c.name}`, value: c.code }))}
                        value={country}
                        onChange={(v) => setCountry(v as CountryCode)}
                    />
                </div>

                <div className="flex flex-col gap-6 md:grid md:grid-cols-2 relative z-10">
                    {/* Left Column: Inputs */}
                    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 h-fit">

                        <div className="flex flex-col gap-4">
                            <Input
                                label={`Gold Rate (per gram) ${currency ? `in ${currency}` : ""}`}
                                type="text"
                                inputMode="decimal"
                                placeholder="e.g. 6,850"
                                value={rate}
                                onChange={handleRateChange}
                            />
                            <Input
                                label="Jewellery Weight (grams)"
                                type="number"
                                placeholder="e.g. 10.5"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>

                        {/* Making Charges */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Making Charges (MC)</label>
                            <div className="flex gap-4">
                                <div className="grid grid-cols-2 bg-black/40 p-1 rounded-2xl border border-white/5 w-[160px] h-14 items-center shrink-0">
                                    <button
                                        onClick={() => setMcType("percentage")}
                                        className={cn(
                                            "h-full rounded-xl text-sm font-medium transition-all flex items-center justify-center",
                                            mcType === "percentage" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        %
                                    </button>
                                    <button
                                        onClick={() => setMcType("flat")}
                                        className={cn(
                                            "h-full rounded-xl text-sm font-medium transition-all flex items-center justify-center",
                                            mcType === "flat" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        {currency || "Flat"}
                                    </button>
                                </div>
                                <Input
                                    type={mcType === "percentage" ? "number" : "text"}
                                    inputMode="decimal"
                                    placeholder={mcType === "percentage" ? "e.g. 12" : "e.g. 2,500"}
                                    value={mcValue}
                                    onChange={handleMcChange}
                                    className="mt-0 flex-1"
                                />
                            </div>
                        </div>

                        {/* Wastage (Optional based on country) */}
                        {currentConfig.showWastage && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">Wastage / VA</label>
                                <div className="flex gap-4">
                                    <div className="grid grid-cols-2 bg-black/40 p-1 rounded-2xl border border-white/5 w-[160px] h-14 items-center shrink-0">
                                        <button
                                            onClick={() => setWastageType("percentage")}
                                            className={cn(
                                                "h-full rounded-xl text-sm font-medium transition-all flex items-center justify-center",
                                                wastageType === "percentage" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            %
                                        </button>
                                        <button
                                            onClick={() => setWastageType("grams")}
                                            className={cn(
                                                "h-full rounded-xl text-sm font-medium transition-all flex items-center justify-center",
                                                wastageType === "grams" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            g
                                        </button>
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder={wastageType === "percentage" ? "e.g. 5" : "e.g. 0.5"}
                                        value={wastageValue}
                                        onChange={(e) => setWastageValue(e.target.value)}
                                        className="mt-0 flex-1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tax Section */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-400 ml-1">{currentConfig.taxName} (%)</label>
                                <button
                                    onClick={() => setIncludeTax(!includeTax)}
                                    className={cn(
                                        "text-xs px-3 py-1 rounded-full border transition-colors",
                                        includeTax
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            : "bg-zinc-800 border-zinc-700 text-zinc-400"
                                    )}
                                >
                                    {includeTax ? "Included" : "Excluded"}
                                </button>
                            </div>
                            {includeTax && (
                                <Input
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(e.target.value)}
                                    placeholder="0"
                                />
                            )}
                        </div>

                        <Button
                            onClick={calculate}
                            className="w-full h-14 mt-2 text-lg font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20"
                        >
                            Calculate Price
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>

                    {/* Right Column: Result Card (Desktop & Mobile) */}
                    <div className="flex flex-col gap-6">
                        <AnimatePresence>
                            {result ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col gap-6"
                                >
                                    {/* Main Receipt Card */}
                                    <div className="flex flex-col gap-4 bg-[#09090b] p-6 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_-10px_rgba(234,179,8,0.2)] relative overflow-hidden">
                                        {/* Golden Glow */}
                                        <div className="absolute top-0 right-0 p-40 bg-yellow-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-yellow-500/10 rounded-xl">
                                                    <Gem className="w-6 h-6 text-yellow-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-zinc-400 text-xs uppercase tracking-wider">Estimate For</span>
                                                    <span className="text-white font-medium">{weight}g Gold</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-zinc-500 block">Rate</span>
                                                <span className="text-sm font-medium text-zinc-300">{formatter(parseFloat(rate))}/g</span>
                                            </div>
                                        </div>

                                        {/* Breakdown */}
                                        <div className="flex flex-col gap-3 relative z-10">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-zinc-400">Gold Base Value</span>
                                                <span className="text-white font-medium">{formatter(result.baseValue)}</span>
                                            </div>
                                            {result.wastageCost > 0 && (
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-zinc-400 text-sm flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Wastage (VA)</span>
                                                    <span className="text-orange-400 font-medium">+ {formatter(result.wastageCost)}</span>
                                                </div>
                                            )}
                                            {result.mcCost > 0 && (
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-zinc-400 text-sm flex items-center gap-1.5"><Hammer className="w-3.5 h-3.5" /> Making Charges</span>
                                                    <span className="text-orange-400 font-medium">+ {formatter(result.mcCost)}</span>
                                                </div>
                                            )}
                                            {result.taxAmount > 0 && (
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-zinc-400 text-sm flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> {currentConfig.taxName} ({taxRate}%)</span>
                                                    <span className="text-yellow-400 font-medium">+ {formatter(result.taxAmount)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                                        {/* Final */}
                                        <div className="flex items-center justify-between px-1 relative z-10">
                                            <span className="text-zinc-300 text-lg font-medium">Final Price</span>
                                            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                                                {formatter(result.finalAmount)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* AI Insight */}
                                    <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20 p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-yellow-500/20 rounded-xl mt-0.5 shadow-inner shadow-yellow-500/20">
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                                                ) : (
                                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Shopping Insight</span>
                                                {loading ? (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="h-4 w-3/4 bg-yellow-500/10 rounded animate-pulse" />
                                                        <div className="h-4 w-1/2 bg-yellow-500/10 rounded animate-pulse" />
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-300 text-sm leading-relaxed">
                                                        {insight || "Calculating..."}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-white/[0.02] rounded-3xl border border-white/5 text-center gap-4">
                                    <div className="p-4 bg-white/5 rounded-full">
                                        <Globe className="w-10 h-10 text-zinc-600" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-zinc-300 font-medium">Select Country & Details</h3>
                                        <p className="text-zinc-500 text-sm max-w-[240px]">
                                            Prices vary by location. We'll adjust taxes and wastage rules automatically.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
