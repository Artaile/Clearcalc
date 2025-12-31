import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: "glass" | "outline" | "flat";
    hover?: boolean;
}

export function Card({ children, className, variant = "glass", hover = true, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-3xl",
                variant === "glass" && "bg-white/[0.03] border border-white/10 backdrop-blur-md",
                variant === "outline" && "border border-white/10",
                variant === "flat" && "bg-[#111114]",
                hover && "transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[0_0_40px_-15px_rgba(255,255,255,0.1)] hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
