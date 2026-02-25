"use client";

import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      primary: "bg-slate-600 text-white hover:bg-slate-500 focus:ring-slate-500",
      secondary: "bg-slate-700 text-gray-200 hover:bg-slate-600 focus:ring-slate-500",
      destructive: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
      ghost: "bg-transparent text-gray-300 hover:bg-slate-700 hover:text-gray-100 focus:ring-slate-500",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "Please wait..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
