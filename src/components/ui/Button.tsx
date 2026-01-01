import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "link";
    size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
                    // Variants
                    variant === "primary" && "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]",
                    variant === "secondary" && "bg-white/10 text-white hover:bg-white/15 border border-white/10",
                    variant === "ghost" && "text-zinc-400 hover:text-white hover:bg-white/5",
                    variant === "link" && "text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline px-0",
                    // Sizes
                    size === "sm" && "h-10 px-4 text-sm",
                    size === "md" && "h-12 px-6 text-base",
                    size === "lg" && "h-14 px-8 text-lg",
                    size === "icon" && "h-10 w-10 p-0",
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
