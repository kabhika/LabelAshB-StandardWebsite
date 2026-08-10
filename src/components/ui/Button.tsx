import type { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center px-6 py-3 text-labelashb-body font-medium transition-colors rounded-labelashb-sm disabled:opacity-40 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-labelashb-accent text-labelashb-accent-foreground hover:bg-labelashb-accent-hover active:bg-labelashb-accent-hover",
  secondary:
    "bg-transparent text-labelashb-ink border border-labelashb-ink hover:bg-labelashb-ink hover:text-labelashb-ground active:bg-labelashb-ink active:text-labelashb-ground",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
