import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center px-6 py-3 text-labelashb-body font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] rounded-labelashb-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

const variants = {
  // Fills with the --color-labelashb-wine slot, which since the Oct 2026
  // Quiet Luxury retone holds the charcoal ink (#2e2c28) - a quiet dark
  // CTA rather than the jewel wine it was before (token name is legacy,
  // see globals.css). Text stays on accent-foreground (oat): ~10.9:1
  // contrast against the charcoal fill, past WCAG AAA for a label.
  primary:
    "bg-labelashb-wine text-labelashb-accent-foreground hover:bg-labelashb-wine-hover active:bg-labelashb-wine-hover",
  secondary:
    "bg-transparent text-labelashb-ink border border-labelashb-ink hover:bg-labelashb-ink hover:text-labelashb-ground active:bg-labelashb-ink active:text-labelashb-ground",
};

type Variant = keyof typeof variants;

// Renders as a real <Link>/<a> when href is given, never a <button> nested
// inside one - a <button> inside an <a> is invalid HTML and was happening
// at 4 call sites (page.tsx, not-found.tsx, style-tile, CartDrawer),
// undermining focus semantics at every one of them.
type ButtonProps =
  | ({ href?: undefined; variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ href: string; variant?: Variant } & AnchorHTMLAttributes<HTMLAnchorElement>);

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (props.href !== undefined) {
    const { href, ...anchorProps } = props as Extract<ButtonProps, { href: string }>;
    return <Link href={href} className={classes} {...anchorProps} />;
  }

  const buttonProps = props as Extract<ButtonProps, { href?: undefined }>;
  return <button className={classes} {...buttonProps} />;
}
