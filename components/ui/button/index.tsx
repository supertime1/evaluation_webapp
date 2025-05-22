import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-slate-900 text-white hover:bg-slate-800": variant === "default",
            "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700": variant === "outline",
            "bg-transparent hover:bg-slate-100 text-slate-700": variant === "ghost",
            "bg-transparent underline-offset-4 hover:underline text-slate-700": variant === "link",
          },
          {
            "h-9 px-4 py-2 text-sm": size === "sm",
            "h-10 px-4 py-2": size === "default",
            "h-11 px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
