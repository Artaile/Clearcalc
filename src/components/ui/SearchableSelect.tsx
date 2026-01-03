"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
    label?: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchableSelect({ label, options, value, onChange, placeholder = "Select...", className }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div ref={containerRef} className={cn("flex flex-col gap-2 w-full", className)}>
            {label && <label className="text-sm font-medium text-zinc-400 ml-1">{label}</label>}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-xl text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                >
                    <span className="truncate">{selectedLabel || placeholder}</span>
                    <ChevronDown className={cn("h-5 w-5 text-zinc-500 transition-transform", isOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 top-full mt-2 w-full z-50 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50"
                        >
                            <div className="p-2 border-b border-white/5 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    autoFocus
                                    className="w-full bg-transparent py-2 pl-8 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                {filteredOptions.length === 0 ? (
                                    <div className="py-3 text-center text-sm text-zinc-500">No results found</div>
                                ) : (
                                    filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onChange(option.value);
                                                setIsOpen(false);
                                                setSearchTerm("");
                                            }}
                                            className={cn(
                                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                                value === option.value ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {value === option.value && <Check className="h-4 w-4" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
