"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
        Fahrenheit: 1, // Placeholder
        Kelvin: 1,     // Placeholder
    }
};

type UnitCategory = "Length" | "Weight" | "Area" | "Speed" | "Temp";

export default function UnitConverter() {
    const [category, setCategory] = useState<UnitCategory>("Length");
    const [amount, setAmount] = useState("");
    const [from, setFrom] = useState("Meter");
    const [to, setTo] = useState("Kilometer");
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        if (!amount) return;
        const val = parseFloat(amount);
        let converted = 0;

        if (category === "Temp") {
            // Special logic for temperature
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

        // precision formatting
        setResult(converted.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    };

    const handleCategoryChange = (c: UnitCategory) => {
        setCategory(c);
        const keys = Object.keys(UNITS[c]);
        setFrom(keys[0]);
        setTo(keys[1] || keys[0]);
        setResult(null);
    }

    return (
        <CalculatorLayout title="Unit Converter" description="Convert length, weight, area & more">
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-2 bg-black/20 p-1 rounded-xl">
                    {(Object.keys(UNITS) as UnitCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={cn(
                                "flex-1 min-w-[30%] py-2 text-xs font-medium rounded-lg transition-colors",
                                category === cat ? "bg-red-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <Input
                        label="Value"
                        type="number"
                        placeholder="e.g. 1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <div className="flex flex-col gap-2 relative">
                        <Select
                            label="From"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            options={Object.keys(UNITS[category]).map(u => ({ label: u, value: u }))}
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-zinc-900 rounded-full p-1 border border-zinc-700 mt-3">
                            <ArrowDown className="w-4 h-4 text-zinc-400" />
                        </div>
                        <Select
                            label="To"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            options={Object.keys(UNITS[category]).map(u => ({ label: u, value: u }))}
                        />
                    </div>

                    <Button onClick={calculate} className="mt-2 text-lg bg-red-500 hover:bg-red-600 shadow-red-500/20">
                        Convert
                    </Button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="bg-red-500/10 border-red-500/20 flex flex-col items-center justify-center py-8 gap-2">
                                <span className="text-zinc-400 text-sm">Result</span>
                                <span className="text-4xl font-bold text-red-400 text-center break-all px-4">
                                    {result} <span className="text-xl text-red-400/70">{to}</span>
                                </span>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CalculatorLayout>
    );
}
