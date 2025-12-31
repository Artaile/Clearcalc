"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps {
    label?: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: { label: string; value: string }[];
    className?: string;
}

export function Select({ label, value, onChange, options, className }: SelectProps) {
    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="text-sm font-medium text-zinc-500 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e)}
                    className={cn(
                        "flex h-14 w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xl text-white outline-none transition-all duration-200 focus:border-white/20 focus:bg-white/[0.05] focus:ring-4 focus:ring-white/5 cursor-pointer",
                        className
                    )}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-zinc-900 border-none">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
            </div>
        </div>
    );
}
