import React from "react";
import { cn } from "@/lib/utils";

export interface ToggleOption<T extends string> {
    label: string;
    value: T;
}

interface InputWithToggleProps<T extends string> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    label: string;
    value: string;
    onChange: (value: string) => void;
    toggleValue: T;
    onToggleChange: (value: T) => void;
    toggleOptions: [ToggleOption<T>, ToggleOption<T>]; // Currently supports exactly 2 options for layout reasons
    placeholder?: string;
    className?: string;
}

export function InputWithToggle<T extends string>({
    label,
    value,
    onChange,
    toggleValue,
    onToggleChange,
    toggleOptions,
    placeholder,
    className,
    ...props
}: InputWithToggleProps<T>) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <label className="text-sm font-medium text-zinc-400 ml-1">{label}</label>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="grid grid-cols-2 bg-black/40 p-1 rounded-2xl border border-white/5 w-[140px] sm:w-[160px] h-14 items-center shrink-0">
                    {toggleOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onToggleChange(option.value)}
                            className={cn(
                                "h-full rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center whitespace-nowrap px-1",
                                toggleValue === option.value
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 min-w-[120px] h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-xl text-white placeholder:text-zinc-700 outline-none transition-all duration-200 focus:border-white/20 focus:bg-white/[0.05] focus:ring-4 focus:ring-white/5 remove-arrow"
                    {...props}
                />
            </div>
            <style jsx>{`
                .remove-arrow::-webkit-inner-spin-button,
                .remove-arrow::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .remove-arrow {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div >
    );
}

// Backward compatibility wrapper for Processing Fee (can be removed after refactoring all)
export function InputWithUnitToggle(props: any) {
    return (
        <InputWithToggle
            {...props}
            toggleValue={props.unit === "percent" ? "percent" : "flat"}
            onToggleChange={(v: string) => props.onUnitChange(v === "percent" ? "percent" : "flat")}
            toggleOptions={[
                { label: "%", value: "percent" },
                { label: "INR", value: "flat" }
            ]}
        />
    );
}
