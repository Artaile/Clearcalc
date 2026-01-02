"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useState, useEffect } from "react";
import { Loader2, ArrowRightLeft, CalendarClock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrencyLabel } from "@/lib/currencyData";

// Common currencies if fetch fails initially
const FALLBACK_CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AED", "CAD", "AUD", "SGD", "CNY"];

export default function CurrencyConverter() {
    const [amount, setAmount] = useState<string>("100");
    const [from, setFrom] = useState("USD");
    const [to, setTo] = useState("INR");
    const [result, setResult] = useState<number | null>(null);
    const [rate, setRate] = useState<number | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    const [currencies, setCurrencies] = useState<{ label: string, value: string }[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);

    // Fetch available currencies on mount
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const res = await fetch("https://open.er-api.com/v6/latest/USD");
                const data = await res.json();
                if (data && data.rates) {
                    const currencyList = Object.keys(data.rates).map(code => ({
                        label: getCurrencyLabel(code),
                        value: code
                    }));
                    setCurrencies(currencyList);
                    setLastUpdate(new Date(data.time_last_update_utc).toLocaleDateString("en-US", {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                    }));
                } else {
                    setCurrencies(FALLBACK_CURRENCIES.map(code => ({ label: getCurrencyLabel(code), value: code })));
                }
            } catch (error) {
                console.error("Failed to fetch currency list", error);
                setCurrencies(FALLBACK_CURRENCIES.map(code => ({ label: getCurrencyLabel(code), value: code })));
            } finally {
                setInitialLoading(false);
            }
        };
        fetchCurrencies();
    }, []);

    // Removed auto-calculate useEffect

    const calculate = async () => {
        if (!amount || !from || !to) return;

        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
            const data = await res.json();

            if (data && data.rates && data.rates[to]) {
                const currentRate = data.rates[to];
                setRate(currentRate);
                setResult(parseFloat(amount) * currentRate);

                // Update time if available from this specific call too
                if (data.time_last_update_utc) {
                    setLastUpdate(new Date(data.time_last_update_utc).toLocaleDateString("en-US", {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                    }));
                }
            }
        } catch (error) {
            console.error("Conversion failed", error);
        }
    };

    const swapCurrencies = () => {
        setFrom(to);
        setTo(from);
        setResult(null); // Clear result on swap
    };

    return (
        <CalculatorLayout title="Currency Converter" description="Real-time global exchange rates">
            <div className="flex flex-col gap-6 relative">

                {/* Inputs */}
                <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative z-20">
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="e.g. 100"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-2xl font-medium"
                    />

                    {/* From/To/Swap Container */}
                    <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 items-center relative">
                        <div className="w-full relative z-20">
                            <SearchableSelect
                                label="From"
                                value={from}
                                onChange={setFrom}
                                options={currencies}
                                placeholder="From Currency"
                            />
                        </div>

                        {/* Center Swap Button - Fixed spacing for mobile */}
                        <div className="relative flex items-center justify-center -my-3 sm:my-0 z-30 pointer-events-none">
                            <span className="pointer-events-auto">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={swapCurrencies}
                                    className="rounded-full bg-zinc-900 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500 transition-all active:rotate-180 h-10 w-10 shadow-xl"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                </Button>
                            </span>
                        </div>

                        <div className="w-full relative z-20">
                            <SearchableSelect
                                label="To"
                                value={to}
                                onChange={setTo}
                                options={currencies}
                                placeholder="To Currency"
                            />
                        </div>
                    </div>

                    {/* Added Convert Button */}
                    <Button
                        onClick={calculate}
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white shadow-lg shadow-violet-500/20"
                    >
                        Convert Currency
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>

                {/* Result */}
                <div className="relative z-10">
                    <AnimatePresence mode="wait">
                        {result !== null && (
                            <motion.div
                                key={from + to + amount}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col gap-4"
                            >
                                <Card className="bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent border-violet-500/20 flex flex-col items-center justify-center py-8 gap-3 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-24 bg-violet-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

                                    <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Converted Amount</span>
                                    <span className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 text-center px-4">
                                        {new Intl.NumberFormat("en-US", { style: "currency", currency: to }).format(result)}
                                    </span>

                                    <div className="flex items-center gap-2 mt-2 bg-black/20 px-4 py-2 rounded-full border border-white/5">
                                        <span className="text-zinc-400 text-sm">Rate:</span>
                                        <span className="text-zinc-200 font-mono">1 {from} = {rate?.toFixed(4)} {to}</span>
                                    </div>

                                    {lastUpdate && (
                                        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[10px] text-zinc-600">
                                            <CalendarClock className="w-3 h-3" />
                                            <span>Updated: {lastUpdate}</span>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {initialLoading && (
                    <div className="flex items-center justify-center py-10 text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading currencies...
                    </div>
                )}
            </div>
        </CalculatorLayout>
    );
}
