"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useState, useEffect } from "react";
import { Loader2, ArrowRightLeft, CalendarClock } from "lucide-react";
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

    // Effect to auto-calculate when dependencies change
    useEffect(() => {
        calculate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, from, to]);

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
    };

    return (
        <CalculatorLayout title="Currency Converter" description="Real-time global exchange rates">
            <div className="flex flex-col gap-6">

                {/* Inputs */}
                <div className="flex flex-col gap-4 relative z-20">
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="e.g. 100"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end">
                        <SearchableSelect
                            label="From"
                            value={from}
                            onChange={setFrom}
                            options={currencies}
                            placeholder="From Currency"
                        />

                        <div className="flex items-center justify-center pb-1">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={swapCurrencies}
                                className="rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 h-10 w-10 mt-6 sm:mt-0"
                            >
                                <ArrowRightLeft className="w-5 h-5" />
                            </Button>
                        </div>

                        <SearchableSelect
                            label="To"
                            value={to}
                            onChange={setTo}
                            options={currencies}
                            placeholder="To Currency"
                        />
                    </div>
                </div>

                {/* Result */}
                <AnimatePresence mode="wait">
                    {result !== null && (
                        <motion.div
                            key={from + to + amount}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col gap-4"
                        >
                            <Card className="bg-purple-500/10 border-purple-500/20 flex flex-col items-center justify-center py-8 gap-3 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-24 bg-purple-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

                                <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Converted Amount</span>
                                <span className="text-4xl sm:text-5xl font-bold text-purple-400 text-center">
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
