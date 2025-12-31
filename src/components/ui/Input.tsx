"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, onChange, value, ...props }, ref) => {
        // Hueristic to detect currency/amount fields
        const isCurrency = label?.toLowerCase().match(/amount|principal|deposit|price|emi|income|contribution/);

        // Format raw value to Indian Number System for display
        const formatDisplayValue = (val: string | number | readonly string[] | undefined) => {
            if (!val) return "";
            const strVal = val.toString();
            if (strVal.trim() === "") return "";

            // Handle decimal
            const parts = strVal.split(".");
            const integerPart = parts[0];
            const decimalPart = parts.length > 1 ? "." + parts[1] : "";

            // Regex for Indian Number System: 1,23,456
            const lastThree = integerPart.substring(integerPart.length - 3);
            const otherNumbers = integerPart.substring(0, integerPart.length - 3);
            const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

            const formattedInteger = otherNumbers !== "" ? formattedOthers + "," + lastThree : lastThree;
            return formattedInteger + decimalPart;
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (isCurrency && onChange) {
                // Strip commas to get raw number
                const rawValue = e.target.value.replace(/,/g, "");

                // Allow only valid number characters (digits and one dot)
                if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
                    const syntheticEvent = {
                        ...e,
                        target: {
                            ...e.target,
                            value: rawValue
                        }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(syntheticEvent);
                }
            } else if (onChange) {
                onChange(e);
            }
        };

        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="text-sm font-medium text-zinc-500 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        type={isCurrency ? "text" : type}
                        inputMode={isCurrency ? "numeric" : undefined}
                        className={cn(
                            "flex h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xl text-white placeholder:text-zinc-700 outline-none transition-all duration-200 focus:border-white/20 focus:bg-white/[0.05] focus:ring-4 focus:ring-white/5",
                            error && "border-red-500/50 focus:ring-red-500/10",
                            className
                        )}
                        ref={ref}
                        value={isCurrency ? formatDisplayValue(value) : value}
                        onChange={handleChange}
                        {...props}
                    />
                    {error && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>}
                </div>
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
