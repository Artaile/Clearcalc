"use client";

import { CalculatorLayout } from "@/components/calculators/CalculatorLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Trash2, Plus, Calculator, Wallet, Coins, Calendar, Bell, BellRing, Edit2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type LoanProfile = {
    id: string;
    name: string;
    amount: number;
    rate: number;
    tenure: number;
    emi: number;
    startDate: string; // YYYY-MM-DD
    paymentDay: number; // 1-31
    reminderEnabled: boolean;
};

export default function LoanProfiles() {
    const [profiles, setProfiles] = useState<LoanProfile[]>([]);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Input State
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("");
    const [tenure, setTenure] = useState("");
    const [startDate, setStartDate] = useState("");
    const [paymentDay, setPaymentDay] = useState("5"); // Default to 5th
    const [reminderEnabled, setReminderEnabled] = useState(true);

    // Load from local storage & Setup Notifications
    useEffect(() => {
        const saved = localStorage.getItem("loan_profiles");
        if (saved) {
            const loadedProfiles: LoanProfile[] = JSON.parse(saved);
            setProfiles(loadedProfiles);
            checkReminders(loadedProfiles);
        }

        // Request Notification Permission
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("loan_profiles", JSON.stringify(profiles));
    }, [profiles]);

    const checkReminders = (currentProfiles: LoanProfile[]) => {
        if (!("Notification" in window) || Notification.permission !== "granted") return;

        const today = new Date();
        const currentDay = today.getDate();

        currentProfiles.forEach(p => {
            if (p.reminderEnabled && p.paymentDay) {
                // Simple check: Is the payment due in 3 days?
                // Logic can be enhanced for handling specific months/dates
                const diff = p.paymentDay - currentDay;
                if (diff > 0 && diff <= 3) {
                    new Notification(`Upcoming EMI for ${p.name}`, {
                        body: `Your EMI of ₹${p.emi.toFixed(0)} is due on the ${p.paymentDay}th.`,
                        icon: "/favicon.ico" // Assuming favicon exists
                    });
                } else if (diff === 0) {
                    new Notification(`EMI Due Today: ${p.name}`, {
                        body: `Your EMI of ₹${p.emi.toFixed(0)} is due today!`,
                        icon: "/favicon.ico"
                    });
                }
            }
        });
    };

    const calculateEMI = (p: number, r: number, t: number) => {
        const ratePerMonth = r / 12 / 100;
        const months = t * 12;
        return (p * ratePerMonth * Math.pow(1 + ratePerMonth, months)) / (Math.pow(1 + ratePerMonth, months) - 1);
    };

    const saveProfile = () => {
        if (!name || !amount || !rate || !tenure || !startDate || !paymentDay) return;

        const p = parseFloat(amount.replace(/,/g, ""));
        const r = parseFloat(rate);
        const t = parseFloat(tenure);
        const emi = calculateEMI(p, r, t);

        const profileData: LoanProfile = {
            id: editingId || Date.now().toString(),
            name,
            amount: p,
            rate: r,
            tenure: t,
            emi,
            startDate,
            paymentDay: parseInt(paymentDay),
            reminderEnabled
        };

        if (editingId) {
            setProfiles(profiles.map(prof => prof.id === editingId ? profileData : prof));
        } else {
            setProfiles([...profiles, profileData]);
        }

        resetForm();
    };

    const editProfile = (profile: LoanProfile) => {
        setEditingId(profile.id);
        setName(profile.name);
        setAmount(profile.amount.toString());
        setRate(profile.rate.toString());
        setTenure(profile.tenure.toString());
        setStartDate(profile.startDate || "");
        setPaymentDay(profile.paymentDay?.toString() || "5");
        setReminderEnabled(profile.reminderEnabled ?? true);
        setShowForm(true);
    };

    const deleteProfile = (id: string) => {
        setProfiles(profiles.filter(p => p.id !== id));
    };

    const resetForm = () => {
        setName("");
        setAmount("");
        setRate("");
        setTenure("");
        setStartDate("");
        setPaymentDay("5");
        setReminderEnabled(true);
        setEditingId(null);
        setShowForm(false);
    };

    const totalEMI = profiles.reduce((acc, curr) => acc + curr.emi, 0);
    const totalLoanAmount = profiles.reduce((acc, curr) => acc + curr.amount, 0);

    const currencyFormatter = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

    return (
        <CalculatorLayout title="Loan Profiles" description="Track and manage your loans">
            <div className="flex flex-col gap-6 pb-20">
                {/* Summary Card */}
                <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 border-none p-0 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="p-6 flex flex-col gap-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-violet-100 text-sm font-medium">Total Monthly Obligation</span>
                                <span className="text-3xl font-bold text-white tracking-tight">
                                    {currencyFormatter(totalEMI)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-violet-200 text-sm bg-black/20 self-start px-3 py-1 rounded-full">
                            <Coins className="w-4 h-4" />
                            Total Debt: {currencyFormatter(totalLoanAmount)}
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-zinc-300 font-medium">Your Loans</h3>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                resetForm();
                                setShowForm(!showForm);
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/5"
                        >
                            {showForm ? <><X className="w-4 h-4 mr-1" /> Cancel</> : <><Plus className="w-4 h-4 mr-1" /> Add Loan</>}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <Card className="bg-white/5 border-white/10 p-4 flex flex-col gap-4 mb-4">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                        <h4 className="text-white font-medium">{editingId ? "Edit Loan" : "New Loan"}</h4>
                                        <span className="text-xs text-zinc-500">All fields required</span>
                                    </div>

                                    <Input label="Loan Name" placeholder="e.g. Home Loan" value={name} onChange={(e) => setName(e.target.value)} />

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input label="Amount" placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                        <Input label="Rate (%)" placeholder="Rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input label="Tenure (Years)" placeholder="Tenure" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} />
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-zinc-400 ml-1">Start Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    onClick={(e) => e.currentTarget.showPicker()}
                                                    className={cn(
                                                        "w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm h-[46px] [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer",
                                                        startDate ? "text-white" : "text-zinc-500"
                                                    )}
                                                />
                                                <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                        <div className="flex flex-col gap-1 w-full">
                                            <label className="text-sm font-medium text-zinc-400">EMI Date (Day of Month)</label>
                                            <select
                                                value={paymentDay}
                                                onChange={(e) => setPaymentDay(e.target.value)}
                                                className="bg-transparent text-white focus:outline-none w-full"
                                            >
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                    <option key={d} value={d} className="bg-zinc-900 text-white">{d}{[1, 21, 31].includes(d) ? 'st' : [2, 22].includes(d) ? 'nd' : [3, 23].includes(d) ? 'rd' : 'th'} of month</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="h-8 w-[1px] bg-white/10" />
                                        <div
                                            className="flex items-center gap-3 cursor-pointer shrink-0"
                                            onClick={() => setReminderEnabled(!reminderEnabled)}
                                        >
                                            <div className={`p-2 rounded-lg transition-colors ${reminderEnabled ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-zinc-500"}`}>
                                                {reminderEnabled ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                            </div>
                                            <span className={`text-sm font-medium ${reminderEnabled ? "text-violet-400" : "text-zinc-500"}`}>
                                                Reminders
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        <Button onClick={saveProfile} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
                                            {editingId ? "Update Profile" : "Save Profile"}
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                        {profiles.length === 0 && !showForm ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2 border border-dashed border-white/10 rounded-2xl"
                            >
                                <Calculator className="w-8 h-8 opacity-50" />
                                <p>No loans added yet</p>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {profiles.map((profile) => (
                                    <motion.div
                                        key={profile.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <Card className="bg-zinc-900 border-white/10 p-4 flex flex-col gap-3 group hover:border-violet-500/30 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="font-medium text-white text-lg">{profile.name}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Due: {profile.paymentDay}{[1, 21, 31].includes(profile.paymentDay) ? 'st' : [2, 22].includes(profile.paymentDay) ? 'nd' : [3, 23].includes(profile.paymentDay) ? 'rd' : 'th'}  Monthly</span>
                                                        {profile.reminderEnabled && <Bell className="w-3 h-3 text-violet-400 ml-1" />}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="flex flex-col items-end mr-2">
                                                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Monthly EMI</span>
                                                        <span className="font-bold text-violet-400 text-lg">{currencyFormatter(profile.emi)}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => editProfile(profile)}
                                                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProfile(profile.id)}
                                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="h-[1px] bg-white/5 w-full my-1" />

                                            <div className="flex justify-between items-center text-xs text-zinc-500">
                                                <div className="flex flex-col">
                                                    <span>Principal</span>
                                                    <span className="text-zinc-300">{currencyFormatter(profile.amount)}</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span>Rate</span>
                                                    <span className="text-zinc-300">{profile.rate}%</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span>Tenure</span>
                                                    <span className="text-zinc-300">{profile.tenure} Years</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CalculatorLayout>
    );
}
