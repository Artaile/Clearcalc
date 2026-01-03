"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useState, useEffect } from "react";
import {
    ArrowRightLeft, // Changed from ArrowUpDown
    Ruler,
    Weight,
    BoxSelect,
    Gauge,
    Thermometer,
    Copy,
    Check,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Define Category Types
type UnitCategory = "Length" | "Weight" | "Area" | "Speed" | "Temp";

// Icons Mapping
const CATEGORY_ICONS: Record<UnitCategory, any> = {
    Length: Ruler,
    Weight: Weight,
    Area: BoxSelect,
    Speed: Gauge,
    Temp: Thermometer,
};

const UNITS: Record<string, Record<string, number>> = {
    Length: {
        Meter: 1,
        Kilometer: 1000,
        Centimeter: 0.01,
        Millimeter: 0.001,
        Inch: 0.0254,
        Foot: 0.3048,
        Yard: 0.9144,
        Mile: 1609.34,
    },
    Weight: {
        Kilogram: 1,
        Gram: 0.001,
        Milligram: 0.000001,
        Pound: 0.453592,
        Ounce: 0.0283495,
    },
    Area: {
        "Square Meter": 1,
        "Square Kilometer": 1000000,
        "Square Foot": 0.092903,
        "Square Inch": 0.00064516,
        "Acre": 4046.86,
        "Hectare": 10000,
    },
    Speed: {
        "Meter/Second": 1,
        "Kilometer/Hour": 0.277778,
        "Mile/Hour": 0.44704,
        "Knot": 0.514444,
    },
    Temp: {
        Celsius: 1,
        Fahrenheit: 1,
        Kelvin: 1,
    }
};

export default function UnitConverter() {
    const [category, setCategory] = useState<UnitCategory>("Length");
    const [amount, setAmount] = useState("");
    const [from, setFrom] = useState("Meter");
    const [to, setTo] = useState("Kilometer");
    const [result, setResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Update From/To when category changes
    useEffect(() => {
        const keys = Object.keys(UNITS[category]);
        setFrom(keys[0]);
        setTo(keys[1] || keys[0]);
        setResult(null);
        setAmount("");
    }, [category]);

    const calculate = () => {
        if (!amount) {
            setResult(null);
            return;
        }
        const val = parseFloat(amount);
        if (isNaN(val)) return;

        let converted = 0;

        if (category === "Temp") {
            // Temperature conversion logic
            if (from === to) {
                converted = val;
            } else if (from === "Celsius") {
                if (to === "Fahrenheit") converted = (val * 9 / 5) + 32;
                if (to === "Kelvin") converted = val + 273.15;
            } else if (from === "Fahrenheit") {
                if (to === "Celsius") converted = (val - 32) * 5 / 9;
                if (to === "Kelvin") converted = (val - 32) * 5 / 9 + 273.15;
            } else if (from === "Kelvin") {
                if (to === "Celsius") converted = val - 273.15;
                if (to === "Fahrenheit") converted = (val - 273.15) * 9 / 5 + 32;
            }
        } else {
            // Standard ratio conversion
            const inBase = val * UNITS[category][from];
            converted = inBase / UNITS[category][to];
        }

        // formatting
        const formatted = converted.toLocaleString(undefined, { maximumFractionDigits: 6 });
        setResult(formatted === "NaN" ? "Error" : formatted);
    };

    const handleSwap = () => {
        setFrom(to);
        setTo(from);
    };

    const copyResult = () => {
        if (result) {
            navigator.clipboard.writeText(`${result} ${to}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <CalculatorLayout
            title="Unit Converter"
            description="Convert length, weight, area, speed & temperature instantly."
        >
            <div className="flex flex-col gap-8">
                {/* Category Tabs - Scrollable on mobile with HIDDEN SCROLLBAR */}
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 scrollbar-hide no-scrollbar snap-x z-30 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {(Object.keys(UNITS) as UnitCategory[]).map((cat) => {
                        const Icon = CATEGORY_ICONS[cat];
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border snap-center whitespace-nowrap",
                                    category === cat
                                        ? "bg-teal-500 text-white border-teal-400 shadow-[0_0_20px_-5px_rgba(20,184,166,0.4)]"
                                        : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {cat}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-6 relative z-20">
                    {/* Input Area */}
                    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                        <Input
                            label="Value"
                            type="number"
                            placeholder="Enter value to convert"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-2xl font-medium"
                        />

                        {/* Flex container for From/To/Swap */}
                        <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 items-center relative">
                            <div className="w-full relative z-20">
                                <SearchableSelect
                                    label="From"
                                    value={from}
                                    onChange={setFrom}
                                    options={Object.keys(UNITS[category]).map(u => ({ label: u, value: u }))}
                                />
                            </div>

                            {/* Center Swap Button - Fixed spacing for mobile */}
                            {/* Using negative margin on vertical stack to pull it closer */}
                            <div className="relative flex items-center justify-center -my-3 sm:my-0 z-30 pointer-events-none">
                                <span className="pointer-events-auto">
                                    <button
                                        onClick={handleSwap}
                                        className="p-2.5 rounded-full bg-zinc-900 border border-zinc-700/50 text-teal-400 hover:text-white hover:border-teal-500/50 hover:bg-teal-500 transition-all active:rotate-180 duration-300 shadow-xl"
                                        aria-label="Swap units"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                    </button>
                                </span>
                            </div>

                            <div className="w-full relative z-20">
                                <SearchableSelect
                                    label="To"
                                    value={to}
                                    onChange={setTo}
                                    options={Object.keys(UNITS[category]).map(u => ({ label: u, value: u }))}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={calculate}
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-lg shadow-teal-500/20"
                        >
                            Convert Values
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>

                    {/* Result Card - Lower z-index to stay behind dropdowns */}
                    <div className="relative z-10">
                        <AnimatePresence mode="wait">
                            {result && (
                                <motion.div
                                    key={result + to} // Animate on result change
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card className="bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border-teal-500/20 flex flex-col items-center justify-center p-8 gap-4 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        <span className="text-zinc-400 text-sm font-medium z-10">Result</span>

                                        <div className="flex flex-col items-center gap-1 z-10">
                                            <span className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 text-center break-all px-4 tracking-tight">
                                                {result}
                                            </span>
                                            <span className="text-lg text-teal-400/60 font-medium">{to}</span>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={copyResult}
                                            className="absolute top-4 right-4 text-zinc-500 hover:text-teal-400 hover:bg-teal-500/10"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
